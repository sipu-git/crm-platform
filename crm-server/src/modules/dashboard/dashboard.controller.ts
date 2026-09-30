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

    async getKpis(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;
        const userId = req.auth!.userId;
        const role = (req.query.role as string) || req.auth!.role || 'ADMIN';
        const tenantSlug = (req.query.tenantSlug as string) || '';

        const data = await dashboardService.getKpis(tenantId, userId, role, tenantSlug);
        return res.status(200).json(successResponse('Dashboard KPIs fetched successfully', data));
    },

    async getRevenue(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;

        const data = await dashboardService.getRevenue(tenantId);
        return res.status(200).json(successResponse('Revenue trend fetched successfully', data));
    },

    async getPipeline(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;

        const data = await dashboardService.getPipeline(tenantId);
        return res.status(200).json(successResponse('Pipeline funnel fetched successfully', data));
    },

    async getLeaderboard(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;

        const data = await dashboardService.getLeaderboard(tenantId);
        return res.status(200).json(successResponse('Leaderboard fetched successfully', data));
    },

    async getTasks(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;
        const userId = req.auth!.userId;
        const role = (req.query.role as string) || req.auth!.role || 'ADMIN';

        const data = await dashboardService.getTasks(tenantId, userId, role);
        return res.status(200).json(successResponse('Tasks fetched successfully', data));
    },

    async getRecent(req: Request, res: Response) {
        const tenantId = req.auth!.tenantId;
        const userId = req.auth!.userId;
        const role = (req.query.role as string) || req.auth!.role || 'ADMIN';

        const data = await dashboardService.getRecent(tenantId, userId, role);
        return res.status(200).json(successResponse('Recent dashboard items fetched successfully', data));
    },
};
