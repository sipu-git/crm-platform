import { Router } from 'express';
import { dealController } from './deal.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(dealController.list));
router.get('/:id', asyncHandler(dealController.getById));
router.post('/', asyncHandler(dealController.create));
router.patch('/:id/stage', asyncHandler(dealController.updateStage));

export default router;
