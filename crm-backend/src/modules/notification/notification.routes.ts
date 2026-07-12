import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(notificationController.listUnread));
router.patch('/:id/read', asyncHandler(notificationController.markRead));
router.patch('/read-all', asyncHandler(notificationController.markAllRead));

export default router;
