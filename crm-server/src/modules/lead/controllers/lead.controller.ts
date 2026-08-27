import type { Request, Response } from 'express';
import { leadFiltersSchema, updateLeadStatusSchema } from '../validations/lead.schema';
import { leadService } from '../services/lead.service';
import { successResponse } from '../../../shared/utils/ApiResponse';
import { CreateAssignInputs } from '../validations/assign.schema';

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
  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }

    const { status } = updateLeadStatusSchema.parse(req.body);
    const lead = await leadService.updateStatus(req.tenantId!, id, status, req.auth!.userId);
    return res.status(201).json(successResponse("Lead modified successfully!", lead))
  },
  async updateLead(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) return res.status(400).json({ message: 'Lead id is required' });
    const lead = await leadService.updateLead(req.tenantId!, id, req.body);
    return res.status(200).json(successResponse("Lead updated successfully!", lead));
  },
  // async convert(req: Request, res: Response) {
  //   const id = req.params.id as any;
  //   if (!id) {
  //     return res.status(400).json({ message: 'Lead id is required' });
  //   }

  //   const contact = await leadService.convertToContact(req.tenantId!, id);
  //   return res.status(201).json(successResponse("Lead converted successfully!", contact))
  // },
  async assign(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: 'Lead id is required' });
    }
    const { assignId, ...info } = req.body as { assignId: string } & CreateAssignInputs;
    if (!assignId) {
      return res.status(400).json({ message: 'assignId is required' });
    }
    const lead = await leadService.assign(req.tenantId!, id, assignId);
    return res.status(200).json(successResponse('Lead assigned successfully!', lead));
  },
  async deleteLead(req: Request, res: Response){
  const id = req.params.id as any;
  if (!id) {
    return res.status(400).json({ message: 'Lead id is required' });
  }
  const lead = await leadService.delete(req.tenantId!, id);
  return res.status(200).json(successResponse('Lead deleted successfully!', lead));
}
};
