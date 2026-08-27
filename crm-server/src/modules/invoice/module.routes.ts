import express from 'express';
import itemsRoutes from './routes/invoice.routes';
import invoiceTotalRoutes from './routes/invoice-total.routes';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';

const invoiceRoot = express.Router();
invoiceRoot.use(authGuard, tenantContext);

invoiceRoot.use("/:invoiceId/items", itemsRoutes);
invoiceRoot.use("/invoice", invoiceTotalRoutes);

export default invoiceRoot;