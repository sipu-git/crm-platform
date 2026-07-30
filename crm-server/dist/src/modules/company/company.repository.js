import { prisma } from "../../../lib/prisma";
export const companyRepository = {
    create(tenantId, data) {
        return prisma.company.create({
            data: {
                tenant_id: tenantId,
                name: data.name,
                industry: data.industry,
                website: data.website
            },
        });
    },
    findManyCompanies(tenantId) {
        return prisma.company.findMany({
            where: { tenant_id: tenantId },
            include: {
                _count: {
                    select: { leads: true },
                },
            },
            orderBy: { created_at: "desc" },
        });
    },
    findCompany(tenantId, id) {
        return prisma.company.findFirst({
            where: { tenant_id: tenantId, id },
        });
    },
    modify(tenantId, id, data) {
        return prisma.company.update({
            where: { id },
            data,
        });
    },
    delete(tenantId, id) {
        return prisma.company.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
    filterCompany(tenantId, filters) {
        return prisma.company.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.industry ? { industry: filters.industry } : {}),
                ...(filters.company ? { name: filters.company } : {}),
                ...(filters.page ? { website: filters.page } : {}),
                ...(filters.limit ? { website: filters.limit } : {}),
            },
        });
    }
};
