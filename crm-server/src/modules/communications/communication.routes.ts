import express from 'express';
import whatsappRoutes from './integrations/whatsapp/whatsapp.route.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { communicationController } from './communication.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
const router = express.Router();

router.use('/whatsapp', whatsappRoutes);

router.use(authGuard, tenantContext);

router.post("/:leadId/send", asyncHandler(communicationController.sendCommunication));
router.get("/:leadId/view-chats", asyncHandler(communicationController.viewCommunications));
export default router;