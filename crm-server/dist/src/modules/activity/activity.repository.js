import { prisma } from "../../../lib/prisma.js";
export const activityRepository = {
    findMany(tenantId, query = {}) {
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
    findById(tenantId, id) {
        return prisma.activities.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    create(tenantId, createdBy, data) {
        return prisma.activities.create({
            data: {
                tenant_id: tenantId,
                deal_id: data.dealId,
                contact_id: data.contactId,
                company_id: data.companyId,
                title: data.title,
                entityType: data.entityType,
                description: data.description,
                status: data.status,
                priority: data.priority,
                due_date: data.dueDate,
                assigned_to: data.assignedTo,
                created_by: createdBy,
            },
        });
    },
    update(tenantId, id, data) {
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
    complete(tenantId, id) {
        return prisma.activities.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                status: "COMPLETED",
                completed_at: new Date(),
            },
        });
    },
    delete(tenantId, id) {
        return prisma.activities.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
};
