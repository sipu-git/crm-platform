import { Router } from 'express';
import { userController } from './users.controller.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', requirePermission('users:read'), userController.list);
router.post('/invite', requirePermission('users:manage'), userController.invite);
router.patch('/:id/role', requirePermission('users:manage'), userController.updateRole);
router.delete('/:id', requirePermission('users:manage'), userController.removeMember);

export default router;