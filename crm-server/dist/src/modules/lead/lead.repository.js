import { LeadStatus } from "../../../generated/prisma/enums.js";
export const leadsRepository = {
    create(tx, tenantId, companyId, contactId, userId, data) {
        return tx.leads.create({
            data: {
                tenant_id: tenantId,
                owner_name: data.owner_name,
                company_name: data.company_name.trim(),
                project_name: data.project_name.trim(),
                project_type: data.project_type?.trim(),
                companyId: companyId,
                contactId: contactId,
                source: data.source,
                status: LeadStatus.NEW,
                created_by: userId,
                created_At: new Date(),
                ...(data.assigned_to ? {
                    assign_to: data.assigned_to
                } : {})
            }
        });
    },
    findByName(tx, tenantId, name) {
        return tx.company.findFirst({
            where: { tenant_id: tenantId, name },
        });
    },
    findById(tx, tenantId, id) {
        return tx.leads.findFirst({
            where: { id, tenant_id: tenantId },
            include: {
                company: true,
                contact: true,
                assignee: true
            },
        });
    },
    findByOwner(tx, tenantId, ownerId) {
        return tx.leads.findMany({
            where: { tenant_id: tenantId, owner_id: ownerId },
            orderBy: { created_At: "desc" },
        });
    },
    findMany(tx, tenantId, filters) {
        return tx.leads.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.assignedTo ? { status: filters.status } : {}),
                ...(filters.source ? { source: filters.source } : {}),
            },
            include: {
                company: true,
                contact: true,
                assignee: true
            },
            orderBy: { created_At: "desc" },
        });
    },
    assignOwner(tx, tenantId, id, ownerId) {
        return tx.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: { owner_id: ownerId },
        });
    },
    markConverted(tx, tenantId, id, contactId) {
        return tx.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                status: LeadStatus.CONTRACTED,
                converted_contact_id: contactId,
            },
        });
    },
    updateStatus(tx, tenantId, id, status) {
        return tx.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                status,
                updated_at: new Date(),
            },
        });
    },
    assignLead(tx, tenantId, id, assignId) {
        return tx.leads.update({
            where: { id, tenant_id: tenantId },
            data: { assigned_to: assignId },
        });
    },
    updateLead(tx, tenantId, id, data) {
        return tx.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: { ...data, updated_at: new Date() },
        });
    },
};
