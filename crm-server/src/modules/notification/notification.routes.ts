import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { deviceTokenController } from './device-token/device.controller.js';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(notificationController.listUnread));
router.get('/all', asyncHandler(notificationController.listAll));
router.post('/device-tokens', asyncHandler(deviceTokenController.register));
router.delete('/device-tokens', asyncHandler(deviceTokenController.unregister));
router.patch('/:id/read', asyncHandler(notificationController.markRead));
router.patch('/read-all', asyncHandler(notificationController.markAllRead));
router.delete('/bulk-delete', asyncHandler(notificationController.removeAllNotification));

export default router;
