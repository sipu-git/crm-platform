import type { Request, Response } from 'express';
import { dealService } from './deal.service';
import { createDealSchema, updateStageSchema } from './deal.schema';

export const dealController = {
  async list(req: Request, res: Response) {
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
    const deals = await dealService.list(req.tenantId!, ownerId);
    res.json(deals);
  },

  async getById(req: Request, res: Response) {
    const deal = await dealService.getById(req.tenantId!, req.params.id);
    res.json(deal);
  },

  async create(req: Request, res: Response) {
    const input = createDealSchema.parse(req.body);
    const deal = await dealService.create(req.tenantId!, req.auth!.userId, input);
    res.status(201).json(deal);
  },

  async updateStage(req: Request, res: Response) {
    const { stage, position } = updateStageSchema.parse(req.body);
    const deal = await dealService.updateStage(req.tenantId!, req.params.id, stage, position);
    res.json(deal);
  },
};
