import { Router } from 'express';
import { authController } from './auth.controller.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';
import { authGuard } from '../../../shared/middleware/authGuard.middleware.js';

const router = Router();

// Tenant creation is intentionally not exposed publicly. Use the one-time
// bootstrap command for the first administrator, then invitation acceptance.
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/list-users', authGuard, asyncHandler(authController.listUsers));

export default router;
