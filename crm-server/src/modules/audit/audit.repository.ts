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
        userId: userId ?? null,
        metaData: metadata === undefined ? undefined : JSON.stringify(metadata),
      },
    });
  },

  findHistory(tenantId: string, entityType?: AuditEntityType, entityId?: string) {
    return prisma.auditLogs.findMany({
      where: {
        tenant_id: tenantId,
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      include: {
        user: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: "desc" },
      take: 200,
    });
  },
};