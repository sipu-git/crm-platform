import { CreateCompanyBody } from "./company.schema.js";
import { companyRepository } from "./company.repository.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { prisma } from "../../../lib/prisma.js";
import { cacheQuery } from "../../shared/redis/query.js";
import redisService from '../../shared/redis/caching.js';

export const companyService = {
    async listCompanies(tenantId: string) {
        const redisKey = `company-list-${tenantId}`;
        return cacheQuery(redisKey, 400, async () => {
            return prisma.$transaction(async (tx) => {
                return companyRepository.findManyCompanies(tx, tenantId);
            });
        })
    },

    async findCompany(tenantId: string, id: string) {
        const redisKey = `company-get-${tenantId}-${id}`;
        return cacheQuery(redisKey, 200, async () => {
            const company = await prisma.$transaction(async (tx) => {
                return companyRepository.findCompany(tx, tenantId, id);
            });
            if (!company) throw ApiError.notFound('Company not found');
            return company;
        })
    },

    async ownCompany(tenantId: string, userId: string) {
        const redisKey = `company-get-${tenantId}-${userId}`;
        return cacheQuery(redisKey, 200, async () => {
            const company = await prisma.$transaction(async (tx) => {
                return companyRepository.findOwnCompany(tx, tenantId, userId);
            });
            if (!company) throw ApiError.notFound('Company not found');
            return company;
        })
    },

    async deleteCompany(tenantId: string, id: string) {
        const companty = await prisma.$transaction(async (tx) => {
            return companyRepository.delete(tx, tenantId, id);
        });
        if (!companty) throw ApiError.notFound('Company not found');

        await Promise.all([
            redisService.deleteByPattern(`company-get-${tenantId}-*`),
            redisService.deleteByPattern(`company-list-${tenantId}-*`),
            redisService.deleteByPattern(`company-filter-${tenantId}-*`),
        ])
        return companty;
    },

    async filterCompany(tenantId: string, filters: any) {
        const filterCompany = `company-filter-${tenantId}-${JSON.stringify(filters)}`;
        return cacheQuery(filterCompany, 300, async () => {
            const company = await prisma.$transaction(async (tx) => {
                return companyRepository.filterCompany(tx, tenantId, filters);
            });
            if (!company || company.length === 0) throw ApiError.notFound('No companies found');
            return company;
        })
    },
    async modify(tenantId: string, companyId: string, data: any) {
        const company = await prisma.$transaction(async (tx) => {
            return companyRepository.modify(tx, tenantId, companyId, data);
        });
        if (!company) throw ApiError.notFound('Company not found');

        await Promise.all([
            redisService.delete(`company-list-${tenantId}`),
            redisService.deleteByPattern(`company-filter-${tenantId}-*`),
            redisService.deleteByPattern(`company-get-${tenantId}-*`),
            // Invalidate lead caches so updated company_name is reflected
            redisService.deleteByPattern(`lead-get-${tenantId}-*`),
            redisService.deleteByPattern(`lead-list-${tenantId}-*`),
            redisService.deleteByPattern(`lead-filter-${tenantId}-*`),
        ]);

        return company;
    },
};