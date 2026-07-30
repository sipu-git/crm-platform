import http from 'http';
import { createApp } from './app.js';
import { env } from './src/shared/configs/env.js';
import { initSocketServer } from './src/modules/notification/socket.js';

const app = createApp();
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`CRM backend listening on port ${env.port} (${env.nodeEnv})`);
});
