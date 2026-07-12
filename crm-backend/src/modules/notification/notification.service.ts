import { notificationRepository } from './notification.repository';
import { emitToUser } from './socket';

export const notificationService = {
  listUnread(tenantId: string, userId: string) {
    return notificationRepository.findUnread(tenantId, userId);
  },

  /** Central dispatch — persists the notification AND pushes it live via Socket.io. */
  async dispatch(tenantId: string, userId: string, type: string, message: string) {
    const notification = await notificationRepository.create(tenantId, userId, type, message);
    emitToUser(userId, 'notification:new', notification);
    return notification;
  },

  markRead(tenantId: string, userId: string, id: string) {
    return notificationRepository.markRead(tenantId, userId, id);
  },

  markAllRead(tenantId: string, userId: string) {
    return notificationRepository.markAllRead(tenantId, userId);
  },
};
