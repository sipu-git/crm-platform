import { prisma } from "../../../lib/prisma";
export const pipelineRepository = {
    findById(tenantId, id) {
        return prisma.pipeline.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    findMany(tenantId) {
        return prisma.pipeline.findMany({
            where: { tenant_id: tenantId },
            orderBy: { sort_order: "asc" },
        });
    },
    create(tenantId, name, sortOrder) {
        return prisma.pipeline.create({
            data: {
                tenant_id: tenantId,
                name,
                sort_order: sortOrder,
            },
        });
    },
    update(tenantId, id, data) {
        return prisma.pipeline.updateMany({
            where: { id, tenant_id: tenantId },
            data,
        });
    },
    delete(tenantId, id) {
        return prisma.pipeline.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
};
