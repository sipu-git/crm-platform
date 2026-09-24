import { Router } from 'express';
import { userController } from './users.controller.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';

const router = Router();
router.get('/invite-details', userController.getInviteDetails);
router.post('/accept-invite', userController.acceptInvite);
router.use(authGuard, tenantContext);

router.get('/', requirePermission('users:read'), userController.list);
router.post('/invite', requirePermission('users:manage'), userController.invite);
router.patch('/:id/role', requirePermission('users:manage'), userController.updateRole);
router.delete('/:id', requirePermission('users:manage'), userController.removeMember);

// Invitation-specific routes
router.get('/invites', requirePermission('users:manage'), userController.listInvites);
router.post('/invites/:id/resend', requirePermission('users:manage'), userController.resendInvite);
router.delete('/invites/:id', requirePermission('users:manage'), userController.revokeInvite);

// Global search for invite dialog
router.get('/search-people', requirePermission('users:manage'), userController.searchPeople);

export default router;
