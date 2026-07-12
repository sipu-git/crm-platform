import { prisma } from '../../core/database/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateLeadInput, LeadFilters } from './lead.schema';

export const leadRepository = {
  async findMany(tenantId: string, filters: LeadFilters) {
    const where: Prisma.LeadWhereInput = {
      tenantId,
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.assignedTo ? { assignedTo: filters.assignedTo } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  },

  findById(tenantId: string, id: string) {
    return prisma.lead.findFirst({ where: { id, tenantId } });
  },

  findByEmail(tenantId: string, email: string) {
    return prisma.lead.findFirst({ where: { tenantId, email } });
  },

  create(tenantId: string, data: CreateLeadInput) {
    return prisma.lead.create({ data: { ...data, tenantId } });
  },

  updateStatus(tenantId: string, id: string, status: string) {
    return prisma.lead.updateMany({ where: { id, tenantId }, data: { status: status as any } });
  },

  assign(tenantId: string, id: string, assignedTo: string) {
    return prisma.lead.updateMany({ where: { id, tenantId }, data: { assignedTo } });
  },
};
