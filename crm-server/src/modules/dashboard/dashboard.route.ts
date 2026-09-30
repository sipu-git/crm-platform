import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';

const router = Router();

router.use(authGuard, tenantContext);

router.get('/overview', dashboardController.getOverview);
router.get('/kpis', dashboardController.getKpis);
router.get('/revenue', dashboardController.getRevenue);
router.get('/pipeline', dashboardController.getPipeline);
router.get('/leaderboard', dashboardController.getLeaderboard);
router.get('/tasks', dashboardController.getTasks);
router.get('/recent', dashboardController.getRecent);

export default router;
