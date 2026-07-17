import { Router } from 'express';
import { dealController } from './deal.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(dealController.list));
router.get('/:id', asyncHandler(dealController.getById));
router.post('/', asyncHandler(dealController.create));
router.patch('/:id/stage', asyncHandler(dealController.updateStage));

export default router;
