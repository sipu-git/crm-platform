import express from 'express';
import whatsappRoutes from './integrations/whatsapp/whatsapp.route.js';
import gmailRoutes from './integrations/gmail/gmail.routes.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { communicationController } from './communication.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = express.Router();

router.use('/whatsapp', whatsappRoutes);
router.use('/gmail', gmailRoutes);
router.use(authGuard, tenantContext);

router.post("/:leadId/send", requirePermission("communications:write"), asyncHandler(communicationController.sendCommunication));
router.get("/:leadId/view-chats", requirePermission("communications:read"), asyncHandler(communicationController.viewCommunications));

export default router;