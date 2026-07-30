import { Server } from 'socket.io';
import { env } from '../../shared/configs/env';
import { verifyAccessToken } from '../../shared/utils/jwt';
let io;
export function initSocketServer(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: env.clientUrl, credentials: true },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error('Missing auth token'));
            const decoded = verifyAccessToken(token);
            socket.data.auth = decoded;
            next();
        }
        catch {
            next(new Error('Invalid auth token'));
        }
    });
    io.on('connection', (socket) => {
        const { userId, tenantId } = socket.data.auth;
        socket.join(`tenant:${tenantId}`);
        socket.join(`user:${userId}`);
    });
    return io;
}
export function getIO() {
    if (!io)
        throw new Error('Socket.io server not initialized — call initSocketServer first');
    return io;
}
export function emitToUser(userId, event, payload) {
    io?.to(`user:${userId}`).emit(event, payload);
}
