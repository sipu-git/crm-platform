import { Router } from 'express';
import { leadController } from './lead.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(leadController.list));
router.get('/:id', asyncHandler(leadController.getById));
router.post('/', asyncHandler(leadController.create));
router.patch('/:id/status', asyncHandler(leadController.updateStatus));
router.patch('/:id/assign', asyncHandler(leadController.assign));
router.post('/:id/convert', asyncHandler(leadController.convert));

export default router;
