import type { Request, Response } from 'express';
import { activityService } from './activity.service';
import { createActivitySchema, listActivitiesQuerySchema } from './activity.schema';

export const activityController = {
  async list(req: Request, res: Response) {
    const { entityType, entityId } = listActivitiesQuerySchema.parse(req.query);
    const activities = await activityService.list(req.tenantId!, entityType, entityId);
    res.json(activities);
  },

  async create(req: Request, res: Response) {
    const input = createActivitySchema.parse(req.body);
    const activity = await activityService.create(req.tenantId!, req.auth!.userId, input);
    res.status(201).json(activity);
  },
};
