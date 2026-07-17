import { Router } from 'express';
import { contactController } from './contact.controller';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(contactController.list));
router.get('/:id', asyncHandler(contactController.getById));
router.post('/', asyncHandler(contactController.create));
router.patch('/:id', asyncHandler(contactController.update));
router.delete('/:id', asyncHandler(contactController.remove));

export default router;
