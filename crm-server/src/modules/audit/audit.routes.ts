import { Router } from 'express';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { requireRole } from '../../shared/configs/rbac';
import { auditController } from './audit.controller';

const router = Router();
router.use(authGuard, tenantContext);

// Audit trail is Admin-only — it's a compliance/security surface.
router.get('/', requireRole('ADMIN'), asyncHandler(auditController.history));

export default router;
