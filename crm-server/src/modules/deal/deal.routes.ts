import { Router } from 'express';
import { dealController } from './deal.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { validate } from '../../shared/middleware/validate.middeware.js';
import { moveStageSchema, updateDealSchema } from './deal.schema.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/deal-list', requirePermission("deals:read"), asyncHandler(dealController.list));
router.get('/deal-stages', requirePermission("deals:stage:read"), asyncHandler(dealController.groupStage));
router.get('/:id', requirePermission("deals:read"), asyncHandler(dealController.getById));
router.patch('/:id', requirePermission("deals:update"), validate({ body: updateDealSchema }), asyncHandler(dealController.updateStage));
router.patch('/:id/move-stage', requirePermission("deals:stage:update"), validate({ body: moveStageSchema }), asyncHandler(dealController.moveStage));
router.delete('/:id', requirePermission("deals:delete"), asyncHandler(dealController.deleteDeal));

export default router;
