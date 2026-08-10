import express from 'express';
import itemsRoutes from './invoice-items/invoice.routes';
import invoiceTotalRoutes from './total-invoices/invoice-total.routes';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';

const invoiceRoot = express.Router();
invoiceRoot.use(authGuard, tenantContext);

invoiceRoot.use("/:invoiceId/items", itemsRoutes);
invoiceRoot.use("/main", invoiceTotalRoutes);

export default invoiceRoot;