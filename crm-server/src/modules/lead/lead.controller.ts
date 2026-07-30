import type { Request, Response } from 'express';
import { leadService } from './lead.service';
import { createLeadSchema, updateLeadStatusSchema, leadFiltersSchema, updateLeadSchema } from './lead.schema';
import { successResponse } from '../../shared/utils/ApiResponse';

export const leadController = {
  async list(req: Request, res: Response) {
    const filters = leadFiltersSchema.parse(req.query);
    const result = await leadService.list(req.tenantId!, filters);
    return res.status(200).json(successResponse("Leads fetched successfully!", result))
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const lead = await leadService.getById(req.tenantId!, id);
    return res.status(200).json(successResponse("Lead fetch successfully!", lead))
  },

  async create(req: Request, res: Response) {
    const input = createLeadSchema.parse(req.body);
    const lead = await leadService.create(req.tenantId!, req.auth!.userId, input);
    return res.status(201).json(successResponse("Lead created successfully!", lead))
  },

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }

    const { status } = updateLeadStatusSchema.parse(req.body);
    const lead = await leadService.updateStatus(req.tenantId!, id, status);
    return res.status(201).json(successResponse("Lead modified successfully!", lead))
  },
  async updateLead(req: Request, res: Response) {
      console.log('RAW BODY:', JSON.stringify(req.body), typeof req.body?.status);
    const id = req.params.id as any;
    if (!id) return res.status(400).json({ message: 'Lead id is required' });

    const data = updateLeadSchema.parse(req.body);
   const lead= await leadService.updateLead(req.tenantId!, id, data);
    return res.status(200).json(successResponse("Lead updated successfully!", lead));
  },
  async convert(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }

    const contact = await leadService.convertToContact(req.tenantId!, id);
    return res.status(201).json(successResponse("Lead converted successfully!", contact))
  },

  async assign(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const { assignedTo } = req.body as { assignedTo: string };
    const lead = await leadService.assign(req.tenantId!, id, assignedTo);
    return res.status(201).json(successResponse("Lead assigned successfully!", lead))
  },
};
