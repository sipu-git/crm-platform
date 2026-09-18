import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { validate } from '../../shared/middleware/validate.middeware.js';
import { enquirySchema } from './enquiry.schema.js';
import { enquiryController } from './enquiry.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = Router();

router.post('/', validate({ body: enquirySchema }), enquiryController.createEnquiry);
router.use(authGuard, tenantContext);
router.get('/', requirePermission("enquires:read"), enquiryController.list);
router.get('/:id', requirePermission("enquires:read"), enquiryController.getById);
router.patch('/approve/:id', requirePermission("enquires:write"), enquiryController.approve);
router.patch('/reject/:id', requirePermission("enquires:write"), enquiryController.markRemoved);
router.delete('/:id', requirePermission("enquires:write"), enquiryController.remove);

export default router;