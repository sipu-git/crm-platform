import { Router } from 'express';
import { activityController } from './activity.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(activityController.list));
router.post('/', asyncHandler(activityController.create));

export default router;
