import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';

export const dashboardController = {
    async getOverview(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;
        const userId = req.auth!.userId;
        const role = req.auth!.role || 'ADMIN';
        const tenantSlug = (req.query.tenantSlug as string) || '';

        const data = await dashboardService.getOverview(tenantId, userId, role, tenantSlug);
        return res.status(200).json(successResponse('Dashboard overview fetched successfully', data));
    },
};

