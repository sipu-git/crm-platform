import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { verifyAccessToken } from '../../core/utils/jwt';
import { env } from '../../core/config/env';

let io: Server | undefined;

/**
 * Initialized once at server bootstrap. Rooms are scoped per-tenant and
 * per-user so notifications can never leak across tenants — every emit
 * targets `tenant:<id>` or `user:<id>`, never a global broadcast.
 */
export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Missing auth token'));
      const decoded = verifyAccessToken(token);
      socket.data.auth = decoded;
      next();
    } catch {
      next(new Error('Invalid auth token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, tenantId } = socket.data.auth;
    socket.join(`tenant:${tenantId}`);
    socket.join(`user:${userId}`);
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io server not initialized — call initSocketServer first');
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}
