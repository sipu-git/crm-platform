import type { Request, Response } from 'express';
import { enquiryService } from './enquiry.service.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { ApiError } from '../../shared/utils/ApiError.js';

export const enquiryController = {
  async createEnquiry(req: Request, res: Response) {
    const enquiry = await enquiryService.createEnquiry(req.body);
    return res.status(201).json(successResponse('Enquiry created', { id: enquiry.id }));
  },

  async list(req: Request, res: Response) {
    const enquiries = await enquiryService.listEnquiry();
    return res.status(200).json(successResponse('Enquiries found', enquiries));
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest('Enquiry id is required');

    const enquiry = await enquiryService.findById(id as string);
    if (!enquiry) throw ApiError.notFound('Enquiry not found');

    return res.status(200).json(successResponse('Enquiry found', enquiry));
  },
  
  async approve(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest('Enquiry id is required');

    const project = await enquiryService.markEnquiryAsApproved(req.auth?.tenantId!, req.auth?.userId!, id as string);
    return res.status(200).json(successResponse('Enquiry approved', project));
  },

  async markRemoved(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest('Enquiry id is required');
    const enquiry = await enquiryService.markRemoved(req.auth?.tenantId!, req.auth?.userId!, id as string);
    return res.status(200).json(successResponse('Enquiry rejected', enquiry));
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest('Enquiry id is required');
    const enquiry = await enquiryService.dropEnquiry(req.auth?.tenantId!, req.auth?.userId!, id as string);
    return res.status(200).json(successResponse('Enquiry deleted', enquiry));
  },
};

