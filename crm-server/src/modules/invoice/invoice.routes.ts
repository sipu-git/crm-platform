import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { requireRole } from '../../shared/configs/rbac';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(invoiceController.list));
router.get('/:id', asyncHandler(invoiceController.getById));
router.post('/', asyncHandler(invoiceController.create));
// Marking paid is a finance-sensitive action — Admin/Manager only.
router.patch('/:id/mark-paid', requireRole('ADMIN', 'MANAGER'), asyncHandler(invoiceController.markPaid));

export default router;
