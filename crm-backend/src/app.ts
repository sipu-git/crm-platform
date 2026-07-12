import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './core/config/env';
import { errorHandler } from './core/middleware/errorHandler';
import { requestLogger } from './core/middleware/requestLogger';

import authRoutes from './modules/auth/auth.routes';
import contactRoutes from './modules/contact/contact.routes';
import leadRoutes from './modules/lead/lead.routes';
import dealRoutes from './modules/deal/deal.routes';
import activityRoutes from './modules/activity/activity.routes';
import invoiceRoutes from './modules/invoice/invoice.routes';
import notificationRoutes from './modules/notification/notification.routes';
import auditRoutes from './modules/audit/audit.routes';

// Event listeners register themselves against the shared event bus —
// importing them here is what "wires" each module's reactive behavior in.
import { registerInvoiceListeners } from './modules/invoice/invoice.listener';
import { registerNotificationListeners } from './modules/notification/notification.listener';
import { registerAuditListeners } from './modules/audit/audit.listener';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Each module owns its own route prefix — no cross-module route nesting.
  app.use('/api/auth', authRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/deals', dealRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/audit', auditRoutes);

  app.use(errorHandler);

  registerInvoiceListeners();
  registerNotificationListeners();
  registerAuditListeners();

  return app;
}
