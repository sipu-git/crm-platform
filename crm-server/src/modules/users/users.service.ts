import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { InviteUserInput, UpdateRoleInput } from './users.schema.js';
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

    async invite(tenantId: string, companyName: string, input: InviteUserInput) {
        const existing = await prisma.user.findFirst({ where: { email: input.email } });
        if (existing) throw ApiError.badRequest('An account with this email already exists');

        let tenantName = companyName?.trim();
        if (!tenantName) {
            const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
            tenantName = tenant?.name || 'ClearView Workspace';
        }

        const tempPassword = crypto.randomBytes(9).toString('base64url');
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const user = await prisma.user.create({
            data: {
                tenantId,
                full_name: input.full_name,
                company_name: tenantName,
                email: input.email,
                mobile: input.mobile,
                password: passwordHash,
                role: input.role,
            },
            select: USER_LIST_SELECT,
        });

        const loginUrl = `${env.clientUrl}/login`;

        await sendInviteEmail({
            fullName: input.full_name,
            email: input.email,
            role: input.role,
            companyName: tenantName,
            tempPassword,
            loginUrl,
        });

        return { user, tempPassword };
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
};