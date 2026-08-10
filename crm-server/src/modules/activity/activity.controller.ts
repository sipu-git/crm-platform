import { Request, Response } from "express";
import { activityService } from "./activity.service.js";
import { createActivitySchema, updateActivitySchema, listActivitiesQuerySchema } from "./activity.schema.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";

export const activityController = {
  async list(req: Request, res: Response) {
    const query = listActivitiesQuerySchema.parse(req.query);
    const activities = await activityService.list(req.tenantId!, query);
    return res.status(200).json(successResponse("Activities fetched successfully!", activities));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "Activity id is required" });
    }
    const activity = await activityService.getById(req.tenantId!, id);
    return res.status(200).json(successResponse("Activity fetched successfully!", activity));
  },

  async create(req: Request, res: Response) {
    const data = createActivitySchema.parse(req.body);
    const activity = await activityService.create(req.tenantId!, req.auth?.userId!, data);
    return res.status(201).json(successResponse("Activity created successfully!", activity));
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "Activity id is required" });
    }
    const data = updateActivitySchema.parse(req.body);
    const activity = await activityService.update(req.tenantId!, id, data);
    return res.status(200).json(successResponse("Activity updated successfully!", activity));
  },

  async complete(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "Activity id is required" });
    }
    const activity = await activityService.complete(req.tenantId!, id);
    return res.status(200).json(successResponse("Activity marked as completed!", activity));
  },

  async remove(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "Activity id is required" });
    }
    await activityService.delete(req.tenantId!, id);
    return res.status(200).json(successResponse("Activity deleted successfully!", null));
  },
};