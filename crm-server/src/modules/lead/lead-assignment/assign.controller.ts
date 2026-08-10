import { Request, Response } from "express";
import { assigneeService } from "./assign.service";
import { assignSchema } from "./assign.schema";
import { successResponse } from "../../../shared/utils/ApiResponse";

export const assigneeController = {
  async create(req: Request, res: Response) {
    const parsed = assignSchema.parse(req.body);
    const assignee = await assigneeService.create(req.tenantId!, parsed);
    return res.status(201).json(successResponse("Assignee created successfully!", assignee));
  },

  async list(req: Request, res: Response) {
    const assignees = await assigneeService.list(req.tenantId!);
    return res.status(200).json(successResponse("Assignees fetched successfully!", assignees));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "Assignee id is required" });
    }
    const assignee = await assigneeService.getById(req.tenantId!, id);
    return res.status(200).json(successResponse("Assignee fetched successfully!", assignee));
  },
};