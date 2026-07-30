import { LeadStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
export const leadsRepository = {
    create(tenantId, ownerId, companyId, data) {
        return prisma.leads.create({
            data: {
                tenant_id: tenantId,
                company_name: data.company_name,
                companyId: companyId,
                full_name: data.full_name,
                source: data.source,
                designation: data.designation,
                status: LeadStatus.NEW,
                owner_id: ownerId,
                created_At: new Date(),
            },
        });
    },
    findByName(tenantId, name) {
        return prisma.company.findFirst({
            where: { tenant_id: tenantId, name },
        });
    },
    findById(tenantId, id) {
        return prisma.leads.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    findByOwner(tenantId, ownerId) {
        return prisma.leads.findMany({
            where: { tenant_id: tenantId, owner_id: ownerId },
            orderBy: { created_At: "desc" },
        });
    },
    findMany(tenantId, filters) {
        return prisma.leads.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.assignedTo ? { status: filters.status } : {}),
                ...(filters.source ? { source: filters.source } : {}),
            },
            orderBy: { created_At: "desc" },
        });
    },
    assignOwner(tenantId, id, ownerId) {
        return prisma.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: { owner_id: ownerId },
        });
    },
    markConverted(tenantId, id, contactId) {
        return prisma.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                status: LeadStatus.CONTRACTED,
                converted_contact_id: contactId,
            },
        });
    },
    updateStatus(tenantId, id, status) {
        return prisma.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                status,
                updated_at: new Date(),
            },
        });
    },
    assignLead(tenantId, id, ownerId) {
        return prisma.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: { owner_id: ownerId },
        });
    },
    updateLead(tenantId, id, data) {
        return prisma.leads.updateMany({
            where: { id, tenant_id: tenantId },
            data: { ...data, updated_at: new Date() },
        });
    },
};
