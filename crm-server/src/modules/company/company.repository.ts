import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";

export const companyRepository = {
    findManyCompanies(tx: PrismaClientTx, tenantId: string) {
        return tx.company.findMany({
            where: { tenant_id: tenantId },
            include: {
                leads: true,
                _count: {
                    select: { leads: true },
                },
            },
            orderBy: { created_at: "desc" },
        });
    },
    findCompany(tx: PrismaClientTx, tenantId: string, id: string) {
        return tx.company.findFirst({
            where: { tenant_id: tenantId, id },
            include:{
                leads: true,
            }
        });
    },
    modify(tx: PrismaClientTx, tenantId: string, id: string, data: any) {
        return tx.company.update({
            where: { id, tenant_id: tenantId },
            data,
        });
    },
    delete(tx: PrismaClientTx, tenantId: string, id: string) {
        return tx.company.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
    filterCompany(tx: PrismaClientTx, tenantId: string, filters: any) {
        return tx.company.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.industry ? { industry: filters.industry as any } : {}),
                ...(filters.company ? { name: filters.company as any } : {}),
                ...(filters.page ? { website: filters.page as any } : {}),
                ...(filters.limit ? { website: filters.limit as any } : {}),
            },
            include:{
                leads: true
            },
            orderBy: { created_at: "desc" },
        });
    },
    upsertStubByName(tx: PrismaClientTx, tenantId: string, ownerId: string, companyName: string, soruce?: string) {
        return tx.company.upsert({
            where: {
                tenant_id_name: {
                    tenant_id: tenantId,
                    name: companyName.trim(),
                }
            },
            update: {},
            create: {
                tenant_id: tenantId,
                name: companyName.trim(),
                owner_id: ownerId,
                source: soruce ?? 'OTHER',
                company_status: 'PROSPECT',
            }
        })
    }
};

