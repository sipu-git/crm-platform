import { AuditEntityType } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";

export const auditRepository = {
  create(
    tenantId: string,
    action: string,
    entityType: AuditEntityType,
    entityId: string,
    userId?: string,
    metadata?: unknown
  ) {
    return prisma.auditLogs.create({
      data: {
        tenant_id: tenantId,
        action,
        entityType,
        entityId,
        userId: userId ?? "",
        metadata: metadata as any,
      },
    });
  },

  findByEntity(tenantId: string, entityType: AuditEntityType, entityId: string) {
    return prisma.auditLogs.findMany({
      where: { tenant_id: tenantId, entityType, entityId },
      orderBy: { created_at: "desc" },
    });
  },
};