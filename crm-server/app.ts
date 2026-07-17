import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './src/modules/auth/auth.routes';
import contactRoutes from './src/modules/contact/contact.routes';
import leadRoutes from './src/modules/lead/lead.routes';
import dealRoutes from './src/modules/deal/deal.routes';
import activityRoutes from './src/modules/activity/activity.routes';
import invoiceRoutes from './src/modules/invoice/invoice.routes';
import notificationRoutes from './src/modules/notification/notification.routes';
import auditRoutes from './src/modules/audit/audit.routes';
import { registerInvoiceListeners } from './src/modules/invoice/invoice.listener';
import { registerNotificationListeners } from './src/modules/notification/notification.listener';
import { registerAuditListeners } from './src/modules/audit/audit.listener';
import { env } from './src/shared/configs/env';
import { requestLogger } from './src/shared/middleware/requestLogger.middleware';
import { errorHandler } from './src/shared/middleware/errorHandler.middleware';
import { connectDB } from './src/shared/configs/db';

export function createApp() {
  const app = express();

  connectDB();
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  
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
