import { Router } from 'express';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { requireRole } from '../../shared/configs/rbac.js';
import { auditController } from './audit.controller.js';
const router = Router();
router.use(authGuard, tenantContext);
// Audit trail is Admin-only — it's a compliance/security surface.
router.get('/', requireRole('ADMIN'), asyncHandler(auditController.history));
export default router;
