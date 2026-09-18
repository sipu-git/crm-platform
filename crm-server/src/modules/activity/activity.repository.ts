import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ListActivitiesQuery,
} from "./activity.schema.js";
import type { AccessTokenPayload } from "../../shared/utils/jwt.js";

function accessScope(user?: AccessTokenPayload) {
  if (!user || user.role === "ADMIN" || user.role === "MANAGER") return {};
  if (user.role === "SALES_REP") {
    return { OR: [{ assigned_to: user.userId }, { created_by: user.userId }] };
  }
  return { id: "__no_activity_access__" };
}

export const activityRepository = {
  findMany(tenantId: string, query: ListActivitiesQuery = {}, user?: AccessTokenPayload) {
    return prisma.activities.findMany({
      where: {
        tenant_id: tenantId,
        ...accessScope(user),
        ...(query.dealId ? { deal_id: query.dealId } : {}),
        ...(query.contactId ? { contact_id: query.contactId } : {}),
        ...(query.companyId ? { company_id: query.companyId } : {}),
      },
      include: { assignee: true },
      orderBy: { created_at: "desc" },
    });
  },

  findById(tenantId: string, id: string, user?: AccessTokenPayload) {
    return prisma.activities.findFirst({
      where: { id, tenant_id: tenantId, ...accessScope(user) },
      include: { assignee: true },
    });
  },

  create(tx: PrismaClientTx, tenantId: string, createdBy: string, data: CreateActivityInput) {
    return tx.activities.create({
      data: {
        tenant_id: tenantId,
        deal_id: data.dealId,
        contact_id: data.contactId,
        company_id: data.companyId,
        title: data.title,
        entityType: data.type,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
        assigned_to: data.assignedTo,
        created_by: createdBy,
      },
      include: { assignee: true },
    });
  },

  update(tenantId: string, id: string, data: UpdateActivityInput) {
    return prisma.activities.update({
      where: { id, tenant_id: tenantId },
      data: {
        title: data.title,
        description: data.description,
        entityType: data.type,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
        assigned_to: data.assignedTo,
      },
      include: { assignee: true },
    });
  },

  complete(tenantId: string, id: string) {
    return prisma.activities.update({
      where: { id, tenant_id: tenantId },
      data: {
        status: "COMPLETED",
        completed_at: new Date(),
      },
      include: { assignee: true },
    });
  },

  viewOwnActivities(tenantId: string, userId: string) {
    return prisma.activities.findMany({
      where: {
        tenant_id: tenantId,
        OR: [
          { assignee: { userId: userId } },
          { created_by: userId },
        ],
      },
      include: { assignee: true },
      orderBy: { created_at: "desc" },
    });
  },
  delete(tenantId: string, id: string) {
    return prisma.activities.delete({
      where: { id, tenant_id: tenantId },
    });
  },
};
