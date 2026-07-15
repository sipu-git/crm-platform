import { prisma } from '../../core/database/prisma';

export const notificationRepository = {
  findUnread(tenantId: string, userId: string) {
    return prisma.notification.findMany({
      where: { tenantId, userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  },

  create(tenantId: string, userId: string, type: string, message: string) {
    return prisma.notification.create({ data: { tenantId, userId, type, message } });
  },

  markRead(tenantId: string, userId: string, id: string) {
    return prisma.notification.updateMany({ where: { id, tenantId, userId }, data: { isRead: true } });
  },

  markAllRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({ where: { tenantId, userId, isRead: false }, data: { isRead: true } });
  },
};
