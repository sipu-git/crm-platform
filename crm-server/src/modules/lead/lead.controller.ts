import type { Request, Response } from 'express';
import { leadService } from './lead.service';
import { createLeadSchema, updateLeadStatusSchema, leadFiltersSchema } from './lead.schema';

export const leadController = {
  async list(req: Request, res: Response) {
    const filters = leadFiltersSchema.parse(req.query);
    const result = await leadService.list(req.tenantId!, filters);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const lead = await leadService.getById(req.tenantId!, req.params.id);
    res.json(lead);
  },

  async create(req: Request, res: Response) {
    const input = createLeadSchema.parse(req.body);
    const lead = await leadService.create(req.tenantId!, input);
    res.status(201).json(lead);
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = updateLeadStatusSchema.parse(req.body);
    const lead = await leadService.updateStatus(req.tenantId!, req.params.id, status);
    res.json(lead);
  },

  async convert(req: Request, res: Response) {
    const contact = await leadService.convertToContact(req.tenantId!, req.params.id);
    res.status(201).json(contact);
  },

  async assign(req: Request, res: Response) {
    const { assignedTo } = req.body as { assignedTo: string };
    const lead = await leadService.assign(req.tenantId!, req.params.id, assignedTo);
    res.json(lead);
  },
};
