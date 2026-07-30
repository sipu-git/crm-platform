import { Router } from 'express';
import { activityController } from './activity.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(activityController.list));
router.post('/', asyncHandler(activityController.create));
router.get('/:id', asyncHandler(activityController.getById));
router.patch('/:id', asyncHandler(activityController.update));
router.post('/:id/complete', asyncHandler(activityController.complete));
router.delete('/:id', asyncHandler(activityController.remove));

export default router;