import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AcceptInviteInput, InviteUserInput, UpdateRoleInput } from './users.schema.js';
import { sendInviteEmail } from '../mail/services/invite-email.service.js';
import { env } from '../../shared/configs/env.js';

const USER_LIST_SELECT = {
    id: true, full_name: true, email: true, role: true,
    mobile: true, createdAt: true,
} as const;

export const userService = {
    async list(tenantId: string) {
        return prisma.user.findMany({
            where: { tenantId },
            select: USER_LIST_SELECT,
            orderBy: { createdAt: 'asc' },
        });
    },

    async listInvites(tenantId: string) {
        return prisma.invite.findMany({
            where: { tenant_id: tenantId, status: 'PENDING' },
            select: {
                id: true,
                email: true,
                mobile: true,
                role: true,
                status: true,
                created_at: true,
            },
            orderBy: { created_at: 'asc' },
        });
    },
    // Resend an invitation email
    async resendInvite(tenantId: string, inviteId: string) {
        const invite = await prisma.invite.findUnique({
            where: { id: inviteId, tenant_id: tenantId },
        });
        if (!invite) throw ApiError.notFound('Invitation not found');
        await sendInviteEmail({
            fullName: invite.full_name ?? '',
            email: invite.email,
            role: invite.role,
            tempPassword: '',
            companyName: 'Workspace',
            acceptUrl: `${env.clientUrl}/accept-invite?token=${encodeURIComponent(invite.token_hash)}`,
        });
        return { success: true };
    },
    // Revoke (delete) a pending invitation
    async revokeInvite(tenantId: string, inviteId: string) {
        const invite = await prisma.invite.findFirst({
            where: { id: inviteId, tenant_id: tenantId, status: 'PENDING' },
        });
        if (!invite) throw ApiError.notFound('Pending invitation not found');
        return prisma.invite.delete({ where: { id: inviteId } });
    },

    async invite(tenantId: string, inviterId: string, input: InviteUserInput) {
        const email = input.email.trim().toLowerCase(); // normalize ONCE, use everywhere below

        const existing = await prisma.user.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' },
            },
            select: { id: true },
        });
        if (existing) throw ApiError.badRequest('An account with this email already exists');

        if (input.role === 'CLIENT') {
            const contact = await prisma.contacts.findFirst({
                where: { tenant_id: tenantId, email: { equals: email, mode: 'insensitive' } },
            });
            if (!contact) throw ApiError.badRequest('Create the tenant contact before inviting a client');
        }

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
        const tenantName = tenant?.name || 'ClearView Workspace';
        const token = crypto.randomBytes(32).toString('base64url');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const tempPassword = crypto.randomBytes(5).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        const invite = await prisma.$transaction(async (tx) => {
            const active = await tx.invite.findFirst({
                where: {
                    tenant_id: tenantId,
                    email: {
                        equals: email,
                        mode: 'insensitive'
                    },
                    status: 'PENDING',
                    expires_at: { gt: new Date() },
                },
            });
            if (active) {
                throw ApiError.badRequest(
                    active.role === input.role
                        ? 'An active invitation already exists for this email and role'
                        : `An active invitation already exists for this email (role: ${active.role})`
                );
            }

            // Expire any stale pending invites for this email (any role), not just same-role ones
            await tx.invite.updateMany({
                where: { tenant_id: tenantId, email, status: 'PENDING', expires_at: { lte: new Date() } },
                data: { status: 'EXPIRED' },
            });

            return tx.invite.create({
                data: {
                    tenant_id: tenantId,
                    email,
                    role: input.role,
                    full_name: input.full_name,
                    mobile: input.mobile,
                    password_hash: passwordHash,
                    token_hash: tokenHash,
                    invited_by_id: inviterId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        });

        await sendInviteEmail({
            fullName: input.full_name,
            email,
            role: input.role,
            tempPassword,
            companyName: tenantName,
            acceptUrl: `${env.clientUrl}/accept-invite?token=${encodeURIComponent(token)}`,
        });

        return {
            id: invite.id,
            email: invite.email,
            role: invite.role,
            full_name: invite.full_name,
            mobile: invite.mobile,
            phone: invite.mobile,
            tempPassword,
            expiresAt: invite.expires_at,
        };
    },
    async getInviteDetails(token: string) {
        if (!token) throw ApiError.badRequest('Token is required');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const invite = await prisma.invite.findUnique({
            where: { token_hash: tokenHash },
            include: { tenant: { select: { name: true } } },
        });
        if (!invite || invite.status !== 'PENDING' || invite.expires_at <= new Date()) {
            throw ApiError.badRequest('This invitation is invalid or has expired');
        }
        return {
            email: invite.email,
            full_name: invite.full_name,
            mobile: invite.mobile,
            role: invite.role,
            tenant_name: invite.tenant.name,
            expires_at: invite.expires_at,
        };
    },

    async acceptInvite(input: AcceptInviteInput) {
        const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');
        return prisma.$transaction(async (tx) => {
            const invite = await tx.invite.findUnique({ where: { token_hash: tokenHash }, include: { tenant: true } });
            if (!invite || invite.status !== 'PENDING' || invite.expires_at <= new Date()) {
                if (invite?.status === 'PENDING') await tx.invite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
                throw ApiError.badRequest('This invitation is invalid or has expired');
            }
            const existing = await tx.user.findFirst({ where: { tenantId: invite.tenant_id, email: invite.email } });
            const contact = invite.role === 'CLIENT'
                ? await tx.contacts.findFirst({ where: { tenant_id: invite.tenant_id, email: invite.email } })
                : null;
            if (invite.role === 'CLIENT' && !contact) throw ApiError.badRequest('Client invitation requires a tenant contact');
            const contactFullName = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : '';
            const fullNameToUse = invite.full_name || contactFullName || invite.email.split('@')[0];
            const mobileToUse = invite.mobile || contact?.phone || '';
            const passwordToUse = input.password
                ? await bcrypt.hash(input.password, 12)
                : (invite.password_hash || await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 12));

            const user = existing ?? await tx.user.create({
                data: {
                    tenantId: invite.tenant_id,
                    full_name: fullNameToUse,
                    company_name: invite.tenant.name,
                    email: invite.email,
                    mobile: mobileToUse,
                    password: passwordToUse,
                    role: invite.role,
                    company_id: contact?.companyId,
                },
                select: USER_LIST_SELECT,
            });
            if (existing && existing.role !== invite.role) throw ApiError.badRequest('An account already exists with a different role');
            await tx.invite.update({
                where: { id: invite.id },
                data: {
                    status: 'ACCEPTED',
                    accepted_user_id: user.id,
                    updated_at: new Date(),
                }
            });
            return {
                ...user,
                phone: user.mobile,
            };
        });
    },

    async updateRole(tenantId: string, targetUserId: string, input: UpdateRoleInput) {
        const target = await prisma.user.findFirst({
            where: { id: targetUserId, tenantId },
        });
        if (!target) throw ApiError.notFound('User not found');

        if (target.role === 'ADMIN' && input.role !== 'ADMIN') {
            const adminCount = await prisma.user.count({ where: { tenantId, role: 'ADMIN' } });
            if (adminCount <= 1) {
                throw ApiError.badRequest('Cannot remove the last admin on this workspace');
            }
        }

        return prisma.user.update({
            where: { id: targetUserId },
            data: { role: input.role },
            select: USER_LIST_SELECT,
        });
    },

    async removeMember(tenantId: string, callerUserId: string, targetUserId: string) {
        if (targetUserId === callerUserId) {
            throw ApiError.badRequest('You cannot remove yourself from the workspace');
        }

        const target = await prisma.user.findFirst({
            where: { id: targetUserId, tenantId },
        });
        if (!target) throw ApiError.notFound('User not found');

        if (target.role === 'ADMIN') {
            const adminCount = await prisma.user.count({ where: { tenantId, role: 'ADMIN' } });
            if (adminCount <= 1) {
                throw ApiError.badRequest('Cannot remove the last admin on this workspace');
            }
        }

        return prisma.$transaction(async (tx) => {
            // Reassign any projects created by this user to the caller
            await tx.project.updateMany({
                where: { tenant_id: tenantId, created_by: targetUserId },
                data: { created_by: callerUserId },
            });

            // Unlink assignee user reference
            await tx.assignee.updateMany({
                where: { tenant_id: tenantId, userId: targetUserId },
                data: { userId: null },
            });

            // Delete the user
            return tx.user.delete({
                where: { id: targetUserId },
                select: USER_LIST_SELECT,
            });
        });
    },

    async searchPeople(tenantId: string, query: string) {
        const q = query.trim().toLowerCase();
        if (!q || q.length < 2) return [];

        const contacts = await prisma.contacts.findMany({
            where: {
                tenant_id: tenantId,
                OR: [
                    { first_name: { contains: q, mode: 'insensitive' } },
                    { last_name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                designation: true,
            },
            take: 15,
            orderBy: { first_name: 'asc' },
        });

        return contacts.map((c) => ({
            id: c.id,
            name: [c.first_name, c.last_name].filter(Boolean).join(' '),
            email: c.email,
            phone: c.phone || '',
            designation: c.designation || '',
            source: 'contact' as const,
        }));
    },
};
