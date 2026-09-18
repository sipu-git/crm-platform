import { prisma } from '../../../../lib/prisma.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt.js';
import { pipelineRepository } from '../../deal/repositories/pipeline.repository.js';
import { ROLE_PERMISSIONS } from '../../rbac/permissions.js';
import { authRepository } from './auth.repository.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import bcrypt from 'bcrypt';

const AUTH_USER_SELECT = {
  id: true, full_name: true, email: true, password: true,
  role: true, tenantId: true, company_id: true, mobile: true,
} as const;

export const authService = {
  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingTenantUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingTenantUser) throw ApiError.badRequest('An account with this email already exists');
    const passwordHash = await bcrypt.hash(input.password, 10);

    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name: input.company_name } });

      await pipelineRepository.seedDefaultStages(tx, tenant.id);

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          full_name: input.full_name,
          company_name: input.company_name,
          email: normalizedEmail,
          password: passwordHash,
          mobile: input.mobile,
          role: 'ADMIN',
        },
      });

      return { tenant, user };
    });

    eventBus.emit('user.registered', { userId: user.id, tenantId: tenant.id });
    return { userId: user.id, tenantId: tenant.id };
  },
  
  async listUsers(tenantId: string, filters: { role?: string }) {
    const users = await prisma.$transaction(async (tx) => {
      return authRepository.findByTenant(tx, tenantId, filters);
    })
    return users;
  },

  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      select: AUTH_USER_SELECT,
    });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw ApiError.unauthorized('Incorrect email or password');
    }

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
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        tenantId: user.tenantId,
        companyId: user.company_id ?? undefined,
      },
      permissions: ROLE_PERMISSIONS[user.role],
    };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: AUTH_USER_SELECT,
    });
    if (!user) throw ApiError.unauthorized('User no longer exists or session has expired');

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      companyId: user.company_id ?? undefined,
    });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        companyId: user.company_id ?? undefined,
      },
      permissions: ROLE_PERMISSIONS[user.role],
    };
  },
};