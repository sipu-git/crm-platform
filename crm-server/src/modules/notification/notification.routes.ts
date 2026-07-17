import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(notificationController.listUnread));
router.patch('/:id/read', asyncHandler(notificationController.markRead));
router.patch('/read-all', asyncHandler(notificationController.markAllRead));

export default router;
