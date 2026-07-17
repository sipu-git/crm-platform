import { prisma } from "../../../lib/prisma";

export const pipelineRepository = {
  findById(tenantId: string, id: string) {
    return prisma.pipeline.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  findMany(tenantId: string) {
    return prisma.pipeline.findMany({
      where: { tenant_id: tenantId },
      orderBy: { sort_order: "asc" },
    });
  },

  create(tenantId: string, name: string, sortOrder: number) {
    return prisma.pipeline.create({
      data: {
        tenant_id: tenantId,
        name,
        sort_order: sortOrder,
      },
    });
  },

  update(tenantId: string, id: string, data: { name?: string; sort_order?: number }) {
    return prisma.pipeline.updateMany({
      where: { id, tenant_id: tenantId },
      data,
    });
  },

  delete(tenantId: string, id: string) {
    return prisma.pipeline.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  },
};