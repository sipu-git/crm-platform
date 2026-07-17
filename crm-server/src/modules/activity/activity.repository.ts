import { prisma } from "../../../lib/prisma";
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ListActivitiesQuery,
} from "./activity.schema";

export const activityRepository = {
  findMany(tenantId: string, query: ListActivitiesQuery = {}) {
    return prisma.activities.findMany({
      where: {
        tenant_id: tenantId,
        ...(query.dealId ? { deal_id: query.dealId } : {}),
        ...(query.contactId ? { contact_id: query.contactId } : {}),
        ...(query.companyId ? { company_id: query.companyId } : {}),
      },
      orderBy: { created_at: "desc" },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.activities.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  create(tenantId: string, createdBy: string, data: CreateActivityInput) {
    return prisma.activities.create({
      data: {
        tenant_id: tenantId,
        deal_id: data.dealId,
        contact_id: data.contactId,
        company_id: data.companyId,
        title: data.title,
        entityType:data.entityType,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
        assigned_to: data.assignedTo,
        created_by: createdBy,
      },
    });
  },

  update(tenantId: string, id: string, data: UpdateActivityInput) {
    return prisma.activities.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
        assigned_to: data.assignedTo,
      },
    });
  },

  complete(tenantId: string, id: string) {
    return prisma.activities.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        status: "COMPLETED",
        completed_at: new Date(),
      },
    });
  },

  delete(tenantId: string, id: string) {
    return prisma.activities.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  },
};