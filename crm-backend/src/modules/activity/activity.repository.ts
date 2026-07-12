import { prisma } from '../../core/database/prisma';
import type { CreateActivityInput } from './activity.schema';

export const activityRepository = {
  findByEntity(tenantId: string, entityType: string, entityId: string) {
    return prisma.activity.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  },

  create(tenantId: string, createdBy: string, data: CreateActivityInput) {
    return prisma.activity.create({ data: { ...data, tenantId, createdBy } });
  },
};
