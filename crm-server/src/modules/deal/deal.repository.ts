import { prisma } from '../../core/database/prisma';
import type { CreateDealInput } from './deal.schema';

export const dealRepository = {
  findMany(tenantId: string, ownerId?: string) {
    return prisma.deal.findMany({
      where: { tenantId, ...(ownerId ? { ownerId } : {}) },
      orderBy: [{ stage: 'asc' }, { position: 'asc' }],
      include: { contact: true },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.deal.findFirst({ where: { id, tenantId }, include: { contact: true } });
  },

  create(tenantId: string, ownerId: string, data: CreateDealInput) {
    return prisma.deal.create({
      data: { ...data, tenantId, ownerId, lastActivityAt: new Date() },
    });
  },

  updateStage(tenantId: string, id: string, stage: string, probability: number, position?: number) {
    return prisma.deal.updateMany({
      where: { id, tenantId },
      data: {
        stage: stage as any,
        probability,
        ...(position !== undefined ? { position } : {}),
        lastActivityAt: new Date(),
      },
    });
  },

  findIdleDeals(tenantId: string, idleSinceDate: Date) {
    return prisma.deal.findMany({
      where: {
        tenantId,
        stage: { notIn: ['WON', 'LOST'] },
        lastActivityAt: { lt: idleSinceDate },
      },
    });
  },
};
