import { Router } from 'express';
import { activityController } from './activity.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(activityController.list));
router.post('/', asyncHandler(activityController.create));

export default router;
