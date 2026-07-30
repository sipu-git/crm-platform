import { prisma } from "../../../lib/prisma.js";
export const auditRepository = {
    create(tenantId, action, entityType, entityId, userId, metadata) {
        return prisma.auditLogs.create({
            data: {
                tenant_id: tenantId,
                action,
                entityType,
                entityId,
                userId: userId ?? "",
                metadata: metadata,
            },
        });
    },
    findByEntity(tenantId, entityType, entityId) {
        return prisma.auditLogs.findMany({
            where: { tenant_id: tenantId, entityType, entityId },
            orderBy: { created_at: "desc" },
        });
    },
};
