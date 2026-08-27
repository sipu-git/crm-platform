import express from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';
import { resetTokenMiddleware } from '../../../shared/middleware/resetToken.middleware.js';
import { recoveryController } from './recovery.controller.js';
const router = express.Router()

router.post("/send-otp", asyncHandler(recoveryController.sendForgotOtp));
router.post("/verify-otp", asyncHandler(recoveryController.verifyForgotPasswordOtp));
router.patch("/reset-password", resetTokenMiddleware, asyncHandler(recoveryController.resetPasswordWithOtpController));

export default router;