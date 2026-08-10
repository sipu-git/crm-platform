import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './src/modules/auth/auth.routes.js';
import contactRoutes from './src/modules/contact/contact.routes.js';
import leadRoutes from './src/modules/lead/lead.routes.js';
import companyRoutes from './src/modules/company/company.routes.js';
import dealRoutes from './src/modules/deal/deal.routes.js';
import activityRoutes from './src/modules/activity/activity.routes.js';
import invoiceRoutes from './src/modules/invoice/invoice.routes.js';
import notificationRoutes from './src/modules/notification/notification.routes.js';
import auditRoutes from './src/modules/audit/audit.routes.js';
import communicationRoutes from './src/modules/communications/communication.routes.js';
import { registerNotificationListeners } from './src/modules/notification/notification.listener.js';
import { registerAuditListeners } from './src/modules/audit/audit.listener.js';
import { env } from './src/shared/configs/env.js';
import { requestLogger } from './src/shared/middleware/requestLogger.middleware.js';
import { errorHandler } from './src/shared/middleware/errorHandler.middleware.js';
import { connectDB } from './src/shared/configs/db.js';
import { registerInvoiceListeners } from './src/modules/invoice/total-invoices/invoice.listener.js';
export function createApp() {
    const app = express();
    connectDB();
    app.use(helmet());
    app.use(cors({ origin: [env.clientUrl, "https://crm-platform-backend-91af.onrender.com"],
        credentials: true }));
    app.use(express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(cookieParser());
    app.use(requestLogger);
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    app.use('/api/auth', authRoutes);
    app.use('/api/contacts', contactRoutes);
    app.use('/api/leads', leadRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/deals', dealRoutes);
    app.use('/api/activities', activityRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/audit', auditRoutes);
    app.use('/api/communications', communicationRoutes);
    app.use(errorHandler);
    registerInvoiceListeners();
    registerNotificationListeners();
    registerAuditListeners();
    return app;
}
