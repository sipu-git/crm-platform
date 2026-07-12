import { Router } from 'express';
import { contactController } from './contact.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(contactController.list));
router.get('/:id', asyncHandler(contactController.getById));
router.post('/', asyncHandler(contactController.create));
router.patch('/:id', asyncHandler(contactController.update));
router.delete('/:id', asyncHandler(contactController.remove));

export default router;
