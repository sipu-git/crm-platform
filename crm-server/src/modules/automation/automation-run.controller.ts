import type { Request, Response } from 'express';
import { ApiError } from '../../shared/utils/ApiError.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { listAutomationRuns } from './services/automation-run.service.js';

export const automationRunController = {
  async list(req: Request, res: Response) {
    const actor = req.auth;
    if (!actor) throw ApiError.unauthorized('Not authenticated');
    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      throw ApiError.forbidden('Only workspace administrators and managers can view automation history.');
    }

    const requestedLimit = Number(req.query.limit ?? 50);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
      throw ApiError.badRequest('limit must be a positive integer.');
    }
    const runs = await listAutomationRuns(actor.tenantId, Math.min(requestedLimit, 100));
    return res.status(200).json(successResponse('AI automation history loaded.', runs));
  },
};
