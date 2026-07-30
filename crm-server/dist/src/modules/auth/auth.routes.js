import { Router } from 'express';
import { authController } from './auth.controller.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
const router = Router();
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
export default router;
