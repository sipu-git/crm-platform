import { Router } from 'express';
import { authController } from './auth.controller.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';
import { authGuard } from '../../../shared/middleware/authGuard.middleware.js';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/list-users', authGuard, asyncHandler(authController.listUsers));

export default router;
