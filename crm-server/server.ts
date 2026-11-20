import http from 'http';
import { createApp } from './app.js';
import { env } from './src/shared/configs/env.js';
import { startCalendarReminderWorker } from './src/modules/apps/calendar/calendar-reminder.worker.js';
import { connectDB } from './src/shared/configs/db.js';
import { verifyConnection } from './src/modules/mail/services/email-connection.service.js';
import { registerInvoiceListeners } from './src/modules/invoice/utils/invoice.listener.js';
import { registerAutomationListeners } from './src/modules/automation/automation.listener.js';
import { registerNotificationListeners } from './src/modules/notification/utils/notification.listener.js';
import { registerAuditListeners } from './src/modules/audit/audit.listener.js';

async function bootstap() {
  try {
    await connectDB()
    await verifyConnection().catch((error) => {
      console.error('Email connection verification failed:', error);
    });
    registerInvoiceListeners();
    registerAutomationListeners();
    registerNotificationListeners();
    registerAuditListeners();

    const app = createApp();
    const httpServer = http.createServer(app);

    httpServer.listen(env.port, () => {
      console.log(`CRM backend listening on port ${env.port} (${env.nodeEnv})`);
      startCalendarReminderWorker();
    });

  }

  catch (err) {
    console.error('Error during server startup:', err);
    process.exit(1);
  }
}
bootstap();
// initSocketServer(httpServer);