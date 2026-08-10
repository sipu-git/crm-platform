import type { Request, Response } from 'express';
import { dealService } from './deal.service.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { moveStageSchema } from './deal.schema.js';

function getId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== 'string') throw ApiError.notFound('deal not found');
  return id;
}

export const dealController = {
  async list(req: Request, res: Response) {
    const deals = await dealService.list(req.tenantId!, req.userId!);
    return res.status(200).json(successResponse("Deal records fetched successfully", deals))
  },

  async getById(req: Request, res: Response) {
    const deal = await dealService.getById(req.tenantId!, getId(req));
    return res.status(200).json(successResponse("deal record fetched successfully", deal))
  },

  async groupStage(req: Request, res: Response) {
    const deal = await dealService.board(req.tenantId!)
    return res.status(200).json(successResponse("Group data fetched successfully", deal))
  },

  async moveStage(req: Request, res: Response) {
    const { id } = req.params;
    const { stageId } = req.body;

    const dealId = Array.isArray(id) ? id[0] : id;
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new ApiError(401, "Unauthorized!");
    }
    if (!dealId) {
      throw new ApiError(400, "Deal id is required");
    }
    const result = await dealService.moveStage(tenantId, dealId, stageId);
    return res.status(200).json(successResponse("Deal stage updated successfully", result));
  },

  async updateStage(req: Request, res: Response) {
    const deal = await dealService.update(req.tenantId!, getId(req), req.body);
    return res.status(201).json(successResponse("Deal modified successfully!", deal))
  },

  async deleteDeal(req: Request, res: Response) {
    const deal = await dealService.delete(req.tenantId!, getId(req));
    return res.status(201).json(successResponse("Deal modified successfully!", deal))
  },
};
