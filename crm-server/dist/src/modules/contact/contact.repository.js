import { prisma } from "../../../lib/prisma.js";
export const contactsRepository = {
    create(tenantId, createdBy, input) {
        return prisma.contacts.create({
            data: {
                tenant_id: tenantId,
                companyId: input.companyId,
                first_name: input.firstName,
                last_name: input.lastName,
                email: input.email,
                phone: input.phone,
                created_by: createdBy,
                updated_at: new Date(),
            },
        });
    },
    findById(tenantId, id) {
        return prisma.contacts.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    findMany(tenantId) {
        return prisma.contacts.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: "desc" },
        });
    },
    findByCompany(tenantId, companyId) {
        return prisma.contacts.findMany({
            where: { tenant_id: tenantId, company_id: companyId },
            orderBy: { created_at: "desc" },
        });
    },
    findByEmail(tenantId, email) {
        return prisma.contacts.findFirst({
            where: { tenant_id: tenantId, email },
        });
    },
    update(tenantId, id, input) {
        return prisma.contacts.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                company_id: input.companyId,
                first_name: input.firstName,
                last_name: input.lastName,
                email: input.email,
                phone: input.phone,
                updated_at: new Date(),
            },
        });
    },
    delete(tenantId, id) {
        return prisma.contacts.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
};
