import http from 'http';
import { createApp } from './app';
import { env } from './src/shared/configs/env';
import { initSocketServer } from './src/modules/notification/socket';

const app = createApp();
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`CRM backend listening on port ${env.port} (${env.nodeEnv})`);
});
