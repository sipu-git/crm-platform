import type { Request, Response } from 'express';
import { ApiError } from '../../shared/utils/ApiError.js';
import { activityService } from './activity.service.js';
import {
  createActivitySchema,
  updateActivitySchema,
  listActivitiesQuerySchema,
} from './activity.schema.js';

function getId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== 'string') throw ApiError.notFound('Activity not found');
  return id;
}

export const activityController = {
  async list(req: Request, res: Response) {
    const query = listActivitiesQuerySchema.parse(req.query);
    const activities = await activityService.list(req.tenantId!, query);
    res.json(activities);
  },

  async getById(req: Request, res: Response) {
    const activity = await activityService.getById(req.tenantId!, getId(req));
    res.json(activity);
  },

  async create(req: Request, res: Response) {
    const input = createActivitySchema.parse(req.body);
    const activity = await activityService.create(req.tenantId!, req.auth!.userId, input);
    res.status(201).json(activity);
  },

  async update(req: Request, res: Response) {
    const input = updateActivitySchema.parse(req.body);
    const activity = await activityService.update(req.tenantId!, getId(req), input);
    res.json(activity);
  },

  async complete(req: Request, res: Response) {
    const activity = await activityService.complete(req.tenantId!, getId(req));
    res.json(activity);
  },

  async remove(req: Request, res: Response) {
    await activityService.remove(req.tenantId!, getId(req));
    res.status(204).send();
  },
};