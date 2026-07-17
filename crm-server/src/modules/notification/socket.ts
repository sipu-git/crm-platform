import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { env } from '../../shared/configs/env';
import { verifyAccessToken } from '../../shared/utils/jwt';

let io: Server | undefined;

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
