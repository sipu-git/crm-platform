import express from 'express';
import whatsappRoutes from './integrations/whatsapp/whatsapp.route.js';
import gmailRoutes from './integrations/gmail/gmail.routes.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { communicationController } from './communication.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';
import { z } from 'zod';
import { sendTransactionalEmail } from '../mail/services/transactional-email.service.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { ApiError } from '../../shared/utils/ApiError.js';

const router = express.Router();
const sendEmailSchema = z.object({
    to: z.string().trim().email(),
    subject: z.string().trim().min(1),
    body: z.string().trim().min(1),
});

router.use('/whatsapp', whatsappRoutes);
router.use('/gmail', gmailRoutes);
router.use(authGuard, tenantContext);

router.post('/email/send', requirePermission("communications:write"), asyncHandler(async (req, res) => {
    const parsed = sendEmailSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, 'A valid recipient, subject, and message body are required');
    }

    const result = await sendTransactionalEmail(parsed.data);
    return res.status(201).json(successResponse('Email sent successfully', result));
}));

router.post("/:leadId/send", requirePermission("communications:write"), asyncHandler(communicationController.sendCommunication));
router.get("/:leadId/view-chats", requirePermission("communications:read"), asyncHandler(communicationController.viewCommunications));

export default router;