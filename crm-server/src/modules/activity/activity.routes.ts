import { Router } from 'express';
import { activityController } from './activity.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', requirePermission("activities:read:own"), asyncHandler(activityController.list));
router.post('/', requirePermission("activities:create"), asyncHandler(activityController.create));
router.get('/:id', requirePermission("activities:read:own"), asyncHandler(activityController.getById));
router.patch('/:id', requirePermission("activities:update"), asyncHandler(activityController.update));
router.post('/:id/complete', asyncHandler(activityController.complete));
router.delete('/:id', requirePermission("activities:delete"), asyncHandler(activityController.remove));

export default router;