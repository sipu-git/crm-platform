import express from 'express';
import assignRoutes from './routes/assign.routes';
import leadRoutes from './routes/lead.routes';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';

const router = express.Router()

router.use(authGuard, tenantContext);

router.use("/assign", assignRoutes);
router.use("/lead", leadRoutes);

export default router;


