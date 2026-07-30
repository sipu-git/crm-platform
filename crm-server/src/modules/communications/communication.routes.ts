import express from 'express';
import whatsappRoutes from './integrations/whatsapp/whatsapp.route';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { communicationController } from './communication.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
const router = express.Router();

router.use('/whatsapp', whatsappRoutes);

router.use(authGuard, tenantContext);

router.post("/:leadId/send", asyncHandler(communicationController.sendCommunication));
router.get("/:leadId/view-chats", asyncHandler(communicationController.viewCommunications));
export default router;