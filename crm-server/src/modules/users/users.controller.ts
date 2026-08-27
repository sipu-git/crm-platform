import type { Request, Response } from 'express';
import { userService } from './users.service.js';
import { inviteUserSchema, updateRoleSchema } from './users.schema.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { ApiError } from '../../shared/utils/ApiError.js';

export const userController = {
    async list(req: Request, res: Response) {
        const users = await userService.list(req.auth!.tenantId);
        res.json(successResponse('Users fetched', users));
    },

    async invite(req: Request, res: Response) {
        const input = inviteUserSchema.parse(req.body);
        const { user, tempPassword } = await userService.invite(
            req.auth!.tenantId,
            req.auth!.companyId ?? '',
            input,
        );
        // tempPassword is returned once here — replace with an email-invite flow before production
        res.status(201).json(successResponse('User invited', { user, tempPassword }));
    },

    async updateRole(req: Request, res: Response) {
        const input = updateRoleSchema.parse(req.body);
        const targetUserId = req.params.id as string;
        if (!targetUserId) {
            throw ApiError.badRequest("Target user id is required!");
        }
        const user = await userService.updateRole(req.auth!.tenantId, targetUserId, input);
        res.json(successResponse('Role updated', user));
    },

    async removeMember(req: Request, res: Response) {
        const targetUserId = req.params.id as string;
        if (!targetUserId) {
            throw ApiError.badRequest("Target user id is required!");
        }
        const removedUser = await userService.removeMember(
            req.auth!.tenantId,
            req.auth!.userId,
            targetUserId,
        );
        res.json(successResponse('Member removed successfully', removedUser));
    },
};