import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../../../../lib/prisma.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { env } from '../../../shared/configs/env.js';
import { checkRateLimit, resetRateLimit, storeOtp, verfiyOtp } from '../../../shared/redis/store-otp.js';
import { generateOTP } from '../password-recovery/otp.util.js';
import { sendOtpEmail } from '../../mail/services/otp-email.service.js';
import { sendInviteEmail } from '../../mail/services/invite-email.service.js';
import { signAccessToken, signRefreshToken } from '../../../shared/utils/jwt.js';
import { pipelineRepository } from '../../deal/repositories/pipeline.repository.js';
import { ROLE_PERMISSIONS } from '../../rbac/permissions.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import type { CompleteSignupInput } from './signup.schema.js';
import { RESERVED_SLUGS } from './signup.util.js';

export const signupService = {
  async sendSignupOtp(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists. Please login instead.');
    }

    await checkRateLimit(normalizedEmail);
    const otp = generateOTP();
    await storeOtp(normalizedEmail, otp, 'SIGNUP');
    await sendOtpEmail({ email: normalizedEmail, otp, type: 'SIGNUP' });

    return {
      success: true,
      message: 'Verification OTP has been sent to your email address.',
    };
  },

  async verifySignupOtp(email: string, otp: string): Promise<{ isValid: boolean; verificationToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await verfiyOtp(normalizedEmail, otp, 'SIGNUP');

    if (!result.isValid) {
      throw ApiError.badRequest('Invalid or expired verification code');
    }

    await resetRateLimit(normalizedEmail);

    const verificationToken = jwt.sign(
      { email: normalizedEmail, type: 'SIGNUP_VERIFIED' },
      env.jwt.accessSecret,
      { expiresIn: '30m' }
    );

    return {
      isValid: true,
      verificationToken,
    };
  },

  async checkSlugAvailability(rawSlug: string): Promise<{ available: boolean; slug: string; reason?: string }> {
    const slug = rawSlug.trim().toLowerCase();

    if (RESERVED_SLUGS.includes(slug)) {
      return { available: false, slug, reason: 'This URL slug is reserved for system use' };
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return { available: false, slug, reason: 'This workspace URL is already taken' };
    }

    return { available: true, slug };
  },

  async completeSignup(input: CompleteSignupInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedSlug = input.tenant_slug.trim().toLowerCase();

    // 1. Verify token
    try {
      const decoded = jwt.verify(input.verificationToken, env.jwt.accessSecret) as { email: string; type: string };
      if (decoded.type !== 'SIGNUP_VERIFIED' || decoded.email.toLowerCase() !== normalizedEmail) {
        throw ApiError.badRequest('Invalid or mismatched email verification token');
      }
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw ApiError.badRequest('Email verification expired or invalid. Please verify your email again.');
    }

    // 2. Check user non-existence again
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists');
    }

    // 3. Check slug availability
    const slugCheck = await this.checkSlugAvailability(normalizedSlug);
    if (!slugCheck.available) {
      throw ApiError.badRequest(slugCheck.reason || 'Workspace URL is unavailable');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // 4. Transactional creation
    const { tenant, user } = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.tenant_name,
          slug: normalizedSlug,
          industry: input.industry,
          company_size: input.company_size,
          website: input.website,
          custom_fields: {
            crm_goals: input.crm_goals || [],
            departments: input.departments || [],
            onboarding_completed: true,
            location: input.location || null,
          },
        },
      });

      // Seed default pipeline stages
      await pipelineRepository.seedDefaultStages(tx, tenant.id);

      // Create primary Company record for Tenant
      const company = await tx.company.create({
        data: {
          tenant_id: tenant.id,
          name: input.tenant_name,
          industry: input.industry,
          website: input.website,
        },
      });

      // Create Tenant Owner User (ADMIN)
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          company_id: company.id,
          full_name: input.full_name,
          company_name: input.tenant_name,
          email: normalizedEmail,
          password: passwordHash,
          mobile: '',
          role: 'ADMIN',
        },
      });

      // Create pending invites if any
      if (input.team_invites && input.team_invites.length > 0) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        for (const inviteItem of input.team_invites) {
          const inviteEmail = inviteItem.email.trim().toLowerCase();
          if (inviteEmail === normalizedEmail) continue;

          const rawToken = crypto.randomBytes(32).toString('hex');
          const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

          await tx.invite.create({
            data: {
              tenant_id: tenant.id,
              email: inviteEmail,
              role: inviteItem.role as any,
              token_hash: tokenHash,
              invited_by_id: user.id,
              expires_at: expiresAt,
              status: 'PENDING',
            },
          });

          // Dispatch email asynchronously
          const inviteUrl = `${process.env.APP_URL || 'http://localhost:5173'}/invite/accept?token=${rawToken}`;
          sendInviteEmail({
            fullName: inviteEmail,
            email: inviteEmail,
            role: inviteItem.role,
            companyName: input.tenant_name,
            acceptUrl: inviteUrl,
          }).catch((e) => console.error(`Failed to send invite email to ${inviteEmail}:`, e));
        }
      }

      return { tenant, user };
    });

    eventBus.emit('user.registered', { userId: user.id, tenantId: tenant.id });

    // 5. Generate Auth Tokens for Auto Login
    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      companyId: user.company_id ?? undefined,
    });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      tenantSlug: tenant.slug,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        companyId: user.company_id ?? undefined,
        tenantSlug: tenant.slug,
      },
      permissions: ROLE_PERMISSIONS[user.role],
    };
  },

  async checkUserExists(email?: string): Promise<{ exists: boolean; count: number; reason?: string }> {
    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (existingUser) {
        return { exists: true, count: 1, reason: 'An account with this email address is already registered.' };
      }
    }

    const userCount = await prisma.user.count();
    return {
      exists: userCount > 0,
      count: userCount,
      reason: userCount > 0 ? 'User workspace accounts already exist.' : 'No workspace accounts registered.',
    };
  },
};

