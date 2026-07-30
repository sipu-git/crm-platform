import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(notificationController.listUnread));
router.patch('/:id/read', asyncHandler(notificationController.markRead));
router.patch('/read-all', asyncHandler(notificationController.markAllRead));

export default router;
