import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js';
import { validate } from '../../../shared/middleware/validate.middeware.js';
import { requirePermission } from '../../../shared/middleware/requireRole.middleware.js';
import { invoiceController } from '../controllers/invoice.controller.js';
import { updateInvoiceSchema } from '../validations/invoice.schema.js';

const router = Router();

router.get('/', requirePermission("invoices:read"), asyncHandler(invoiceController.list));
router.get('/:id', requirePermission("invoices:read"), asyncHandler(invoiceController.getById));
router.get('/view-own-invoice', requirePermission("invoices:read:own_company"), asyncHandler(invoiceController.viewOwnInvoice));
router.patch('/:id/modify-invoice', requirePermission("invoices:update"), validate({ body: updateInvoiceSchema }), asyncHandler(invoiceController.modifyInvoice));
router.patch('/:id/mark-paid', requirePermission("invoices:update"), asyncHandler(invoiceController.markPaid));
router.delete('/:id', requirePermission("invoices:delete"), asyncHandler(invoiceController.dropInvoice));

export default router;
