import { prisma } from "../../../lib/prisma.js";
import { Role } from "../../shared/configs/role.js";
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
            include: {
                _count: {
                    select: {
                        leads: true
                    }
                }
            },
        });
    },

    findOwnCompany(tx: PrismaClientTx, tenantId: string, userId: string) {
        return prisma.user.findFirst({
            where: {
                id: userId,
                tenantId,
                role: {
                    in: ["CLIENT"]
                }
            },
            include: { company: true }
        })
    },

    async modify(tx: PrismaClientTx, tenantId: string, companyId: string, data: any) {
        const updatedCompany = await tx.company.update({
            where: { tenant_id: tenantId, id: companyId },
            data,
        });

        // Sync denormalized company_name on all linked leads
        if (data.name) {
            await tx.leads.updateMany({
                where: { companyId, tenant_id: tenantId },
                data: { company_name: data.name },
            });
        }

        return updatedCompany;
    },

    delete(tx: PrismaClientTx, tenantId: string, id: string) {
        return tx.company.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
    filterCompany(tx: PrismaClientTx, tenantId: string, filters: any) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 20;

        return tx.company.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.industry ? { industry: filters.industry } : {}),
                ...(filters.company ? { name: { contains: filters.company, mode: "insensitive" } } : {}),
            },
            include: { leads: true },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });
    },
    async upsertStubByName(tx: PrismaClientTx, tenantId: string | undefined, ownerId: string | undefined, companyName: string, soruce?: string) {
        if (tenantId) {
            // tenant‑aware upsert – uses the composite unique (tenant_id, name)
            return tx.company.upsert({
                where: { tenant_id_name: { tenant_id: tenantId, name: companyName.trim() } },
                update: {},
                create: {
                    tenant_id: tenantId,
                    name: companyName.trim(),
                    owner_id: ownerId,
                    source: soruce ?? 'OTHER',
                    company_status: 'PROSPECT',
                },
            });
        }
        // public (no tenant) fallback lookup
        const existing = await tx.company.findFirst({
            where: { name: companyName.trim() },
        });
        if (existing) return existing;

        throw new Error("tenantId is required to create a new company");
    },
};

