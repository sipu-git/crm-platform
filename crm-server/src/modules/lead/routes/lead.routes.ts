import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';
import { updateLeadSchema, updateLeadStatusSchema } from '../validations/lead.schema.js';
import { validate } from '../../../shared/middleware/validate.middeware.js';
import { requirePermission } from '../../../shared/middleware/requireRole.middleware.js';
import { leadController } from '../controllers/lead.controller.js';

const router = Router();

router.get('/', requirePermission("leads:read"), asyncHandler(leadController.list));
router.get('/:id', requirePermission("leads:read"), asyncHandler(leadController.getById));
router.patch('/:id/status', requirePermission("leads:status:update"), validate({ body: updateLeadStatusSchema }), asyncHandler(leadController.updateStatus));
router.patch('/modify-lead/:id', requirePermission("leads:update"), validate({ body: updateLeadSchema }), asyncHandler(leadController.updateLead));
router.patch('/:id/assign', requirePermission("leads:assign"), asyncHandler(leadController.assign));
router.delete('/:id/delete', requirePermission("leads:delete"), asyncHandler(leadController.deleteLead));

export default router;
