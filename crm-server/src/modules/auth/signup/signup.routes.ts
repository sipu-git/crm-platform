import { Router } from 'express';
import { signupController } from './signup.controller.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';

const router = Router();

router.post('/send-otp', asyncHandler(signupController.sendOtp));
router.post('/verify-otp', asyncHandler(signupController.verifyOtp));
router.post('/check-slug', asyncHandler(signupController.checkSlug));router.post('/check-exists', asyncHandler(signupController.checkUserExists));
router.post('/complete', asyncHandler(signupController.complete));

export default router;

