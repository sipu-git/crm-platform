import express from 'express';
import authRoute from './authentication/auth.routes.js';
import recoveryRoutes from './password-recovery/recovery.routes.js';
import signupRoutes from './signup/signup.routes.js';

const router = express.Router();

router.use("/auth/signup", signupRoutes);
router.use("/auth", authRoute);
router.use("/recovery", recoveryRoutes);

export default router;