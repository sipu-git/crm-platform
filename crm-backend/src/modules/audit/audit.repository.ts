import { prisma } from '../../core/database/prisma';

export const auditRepository = {
  create(tenantId: string, action: string, entityType: string, entityId: string, userId?: string, metadata?: unknown) {
    return prisma.auditLog.create({
      data: { tenantId, action, entityType, entityId, userId, metadata: metadata as any },
    });
  },

  findByEntity(tenantId: string, entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
