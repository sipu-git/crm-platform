import { prisma } from "../../../lib/prisma.js";
import { CreateCompanyBody, FilterCompanyQuery, UpdateCompanyBody } from "./company.schema.js";

export const companyRepository = {
    create(tenantId: string, data: CreateCompanyBody) {
        return prisma.company.create({
            data: {
                tenant_id: tenantId,
                name: data.name,
                industry: data.industry,
                website: data.website
            },
        });
    },
    findManyCompanies(tenantId: string) {
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
    findCompany(tenantId: string, id: string) {
        return prisma.company.findFirst({
            where: { tenant_id: tenantId, id },
        });
    },
    modify(tenantId: string, id: string, data: any) {
        return prisma.company.update({
            where: { id },
            data,
        });
    },
    delete(tenantId: string, id: string) {
        return prisma.company.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
    filterCompany(tenantId: string, filters: any) {
        return prisma.company.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.industry ? { industry: filters.industry as any } : {}),
                ...(filters.company ? { name: filters.company as any } : {}),
                ...(filters.page ? { website: filters.page as any } : {}),
                ...(filters.limit ? { website: filters.limit as any } : {}),
            },
        });
    }
};
