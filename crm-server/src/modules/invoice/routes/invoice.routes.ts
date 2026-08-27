import express from 'express';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware';
import { requirePermission } from '../../../shared/middleware/requireRole.middleware';
import { invoiceItemsController } from '../controllers/items.controller';

const router = express.Router({ mergeParams: true });

router.get('/', requirePermission("invoices:read"), asyncHandler(invoiceItemsController.list));
router.post('/', requirePermission("invoices:write"), asyncHandler(invoiceItemsController.create));
router.get('/:id', requirePermission("invoices:read"), asyncHandler(invoiceItemsController.getById));
router.patch('/:id', requirePermission("invoices:update"), asyncHandler(invoiceItemsController.update));
router.delete('/:id', requirePermission("invoices:delete"), asyncHandler(invoiceItemsController.remove));

export default router;