import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';

const router = Router();

router.use(authGuard, tenantContext);

router.get('/overview', dashboardController.getOverview);

export default router;

