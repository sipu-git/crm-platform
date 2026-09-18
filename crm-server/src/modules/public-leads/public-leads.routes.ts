import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { publicLeadSchema } from './public-leads.schema.js';
import { publicLeadService } from './public-leads.service.js';

const router = Router();
router.post('/', asyncHandler(async (req, res) => {
  const lead = await publicLeadService.submit(publicLeadSchema.parse(req.body));
  res.status(201).json(successResponse('Requirement submitted', { id: lead.id }));
}));
export default router;
