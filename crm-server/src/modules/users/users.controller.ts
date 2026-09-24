import type { Request, Response } from 'express';
import { userService } from './users.service.js';
import { acceptInviteSchema, inviteUserSchema, searchPeopleSchema, updateRoleSchema } from './users.schema.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { ApiError } from '../../shared/utils/ApiError.js';

export const userController = {
    async list(req: Request, res: Response) {
        const users = await userService.list(req.auth!.tenantId);
        return res.status(200).json(successResponse('Users fetched', users));
    },

    async invite(req: Request, res: Response) {
        const input = inviteUserSchema.parse(req.body);
        const invite = await userService.invite(
            req.auth!.tenantId,
            req.auth!.userId,
            input,
        );
        res.status(201).json(successResponse('Invitation created', invite));
    },

    async getInviteDetails(req: Request, res: Response) {
        const token = req.query.token as string;
        const details = await userService.getInviteDetails(token);
        res.status(200).json(successResponse('Invitation details fetched', details));
    },

    async acceptInvite(req: Request, res: Response) {
        const user = await userService.acceptInvite(acceptInviteSchema.parse(req.body));
        res.status(201).json(successResponse('Invitation accepted', user));
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

    async listInvites(req: Request, res: Response) {
        const invites = await userService.listInvites(req.auth!.tenantId);
        return res.status(200).json(successResponse('Invitations fetched', invites));
    },

    async resendInvite(req: Request, res: Response) {
        const inviteId = req.params.id as string;
        if (!inviteId) throw ApiError.badRequest('Invite id is required');
        const result = await userService.resendInvite(req.auth!.tenantId, inviteId);
        return res.status(200).json(successResponse('Invitation resent', result));
    },

    async revokeInvite(req: Request, res: Response) {
        const inviteId = req.params.id as string;
        if (!inviteId) throw ApiError.badRequest('Invite id is required');
        await userService.revokeInvite(req.auth!.tenantId, inviteId);
        return res.status(200).json(successResponse('Invitation revoked', null));
    },

    async searchPeople(req: Request, res: Response) {
        const { q } = searchPeopleSchema.parse(req.query);
        const results = await userService.searchPeople(req.auth!.tenantId, q);
        return res.status(200).json(successResponse('Search results', results));
    },
};
