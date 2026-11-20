
import serverless from 'serverless-http';
import { createApp } from './app.js';
import { connectDB } from './src/shared/configs/db.js';
import { verifyConnection } from './src/modules/mail/services/email-connection.service';
import { registerInvoiceListeners } from './src/modules/invoice/utils/invoice.listener.js';
import { registerAutomationListeners } from './src/modules/automation/automation.listener.js';
import { registerNotificationListeners } from './src/modules/notification/utils/notification.listener.js';
import { registerAuditListeners } from './src/modules/audit/audit.listener.js';

const app = createApp();
const expressHandler = serverless(app);
let initializationPromise: Promise<void> | undefined;
async function initializeApplication() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            await connectDB();
            await verifyConnection().catch((error) => {
                console.error('Email connection verification failed:', error);
            });

            registerInvoiceListeners();
            registerAutomationListeners();
            registerNotificationListeners();
            registerAuditListeners();

        })().catch((error) => {
            initializationPromise = undefined;
            throw error;
        });
    }
    await initializationPromise;
}

export const handler = async (event: any, context: any) => {
    await initializeApplication();

    return expressHandler(event, context);
};
