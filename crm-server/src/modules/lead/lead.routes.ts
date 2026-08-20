import { Router } from 'express';
import { leadController } from './lead.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import {  updateLeadSchema, updateLeadStatusSchema } from './lead.schema.js';
import { validate } from '../../shared/middleware/validate.middeware.js';
import assignRoutes from './lead-assignment/assign.routes.js';

const router = Router();
router.use(authGuard, tenantContext);
router.use("/assign", assignRoutes)

router.get('/', asyncHandler(leadController.list));
router.get('/:id', asyncHandler(leadController.getById));
router.patch('/:id/status', validate({ body: updateLeadStatusSchema }), asyncHandler(leadController.updateStatus));
router.patch('/modify-lead/:id', validate({ body: updateLeadSchema }), asyncHandler(leadController.updateLead));
router.patch('/:id/assign', asyncHandler(leadController.assign));
router.delete('/:id/delete', asyncHandler(leadController.deleteLead));

export default router;
