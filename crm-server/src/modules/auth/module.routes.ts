import express from 'express';
import authRoute from './authentication/auth.routes';
import recoveryRoutes from './password-recovery/recovery.routes';

const router = express.Router()

router.use("/auth", authRoute)
router.use("/recovery", recoveryRoutes)

export default router;