import { Router } from 'express';
import { contactController } from './contact.controller.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = Router();
router.get('/auto-fetch', asyncHandler(contactController.autoFillForm));
router.use(authGuard, tenantContext);
router.get('/', requirePermission("contacts:read"), asyncHandler(contactController.list));
router.get('/:id', requirePermission("contacts:read"), asyncHandler(contactController.getById));
router.patch('/:id', requirePermission("contacts:update"), asyncHandler(contactController.update));
router.delete('/:id', requirePermission("contacts:delete"), asyncHandler(contactController.remove));

export default router;
