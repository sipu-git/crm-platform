import { Router } from 'express';
import { auditController } from './audit.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { requireRole } from '../../core/middleware/rbac';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

// Audit trail is Admin-only — it's a compliance/security surface.
router.get('/', requireRole('ADMIN'), asyncHandler(auditController.history));

export default router;
