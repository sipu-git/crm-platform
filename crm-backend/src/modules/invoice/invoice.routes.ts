import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { authGuard } from '../../core/middleware/authGuard';
import { tenantContext } from '../../core/middleware/tenantContext';
import { requireRole } from '../../core/middleware/rbac';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();
router.use(authGuard, tenantContext);

router.get('/', asyncHandler(invoiceController.list));
router.get('/:id', asyncHandler(invoiceController.getById));
router.post('/', asyncHandler(invoiceController.create));
// Marking paid is a finance-sensitive action — Admin/Manager only.
router.patch('/:id/mark-paid', requireRole('ADMIN', 'MANAGER'), asyncHandler(invoiceController.markPaid));

export default router;
