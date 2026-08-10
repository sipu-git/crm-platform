import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ListActivitiesQuery,
} from "./activity.schema.js";

export const activityRepository = {
  findMany(tenantId: string, query: ListActivitiesQuery = {}) {
    return prisma.activities.findMany({
      where: {
        tenant_id: tenantId,
        ...(query.dealId ? { deal_id: query.dealId } : {}),
        ...(query.contactId ? { contact_id: query.contactId } : {}),
        ...(query.companyId ? { company_id: query.companyId } : {}),
      },
      include: { assignee: true },
      orderBy: { created_at: "desc" },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.activities.findFirst({
      where: { id, tenant_id: tenantId },
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
  // Note: tenant ownership must already be verified by the caller
  // (service layer calls findById first) before these run, since
  // `update`/`delete` can only filter by the unique `id` field.
  update(tenantId: string, id: string, data: UpdateActivityInput) {
    return prisma.activities.update({
      where: { id },
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
      where: { id },
      data: {
        status: "COMPLETED",
        completed_at: new Date(),
      },
      include: { assignee: true },
    });
  },

  delete(tenantId: string, id: string) {
    return prisma.activities.delete({
      where: { id },
    });
  },
};