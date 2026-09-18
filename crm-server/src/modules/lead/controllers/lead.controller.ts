import type { Request, Response } from 'express';
import { leadFiltersSchema, searchLeadsQuerySchema, updateLeadStatusSchema } from '../validations/lead.schema.js';
import { leadService } from '../services/lead.service.js';
import { successResponse } from '../../../shared/utils/ApiResponse.js';

export const leadController = {
  async list(req: Request, res: Response) {
    const filters = leadFiltersSchema.parse(req.query);
    const result = await leadService.list(req.tenantId!, filters, req.auth!);
    return res.status(200).json(successResponse("Leads fetched successfully!", result));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const lead = await leadService.getById(req.tenantId!, id as string, req.auth!);
    return res.status(200).json(successResponse("Lead fetch successfully!", lead));
  },

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }

    const { status } = updateLeadStatusSchema.parse(req.body);
    const lead = await leadService.updateStatus(req.tenantId!, id as string, status, req.auth!.userId, req.auth!);
    return res.status(201).json(successResponse("Lead modified successfully!", lead));
  },

  async updateLead(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Lead id is required' });
    const lead = await leadService.updateLead(req.tenantId!, id as string, req.body, req.auth!);
    return res.status(200).json(successResponse("Lead updated successfully!", lead));
  },

  async deleteLead(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const lead = await leadService.delete(req.tenantId!, id as string, req.auth!);
    return res.status(200).json(successResponse('Lead deleted successfully!', lead));
  },

  async searchLeads(req: Request, res: Response) {
    const parsed = searchLeadsQuerySchema.parse(req.query);
    const result = await leadService.searchLeads(req.tenantId!, parsed.query, parsed.limit, req.auth!);
    return res.status(200).json(successResponse("Leads fetched successfully!", result));
  },

  async convertToClient(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const result = await leadService.convertToClient(req.tenantId!, id as string, req.auth!);
    return res.status(200).json(successResponse("Lead converted to client successfully!", result));
  },
};
