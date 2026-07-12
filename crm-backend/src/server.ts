import http from 'http';
import { createApp } from './app';
import { env } from './core/config/env';
import { initSocketServer } from './modules/notification/socket';

const app = createApp();
const httpServer = http.createServer(app);

// Socket.io attaches to the same HTTP server — one process, one port,
// consistent with the modular-monolith deployment model.
initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`CRM backend listening on port ${env.port} (${env.nodeEnv})`);
});
