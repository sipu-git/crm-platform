import { CreateCompanyBody } from "./company.schema.js";
import { companyRepository } from "./company.repository.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { prisma } from "../../../lib/prisma.js";
import { cacheQuery } from "../../shared/redis/query.js";
import redisService from '../../shared/redis/caching.js';
import { PaginationParams } from "./company.types.js";
import { mediaRepository } from "../profiles/repository/media.repository.js";
import { generateImageUrl } from "../../shared/utils/bucket.util.js";

async function attachPresignedLogo(company: any) {
    if (!company) return company;
    if (Array.isArray(company.data)) {
        company.data = await Promise.all(
            company.data.map(async (c: any) => ({
                ...c,
                logoUrl: c.logo_url ? await generateImageUrl(c.logo_url) : null,
            }))
        );
        return company;
    }
    if (company.company) {
        company.company.logoUrl = company.company.logo_url
            ? await generateImageUrl(company.company.logo_url)
            : null;
        return company;
    }
    return {
        ...company,
        logoUrl: company.logo_url ? await generateImageUrl(company.logo_url) : null,
    };
}

export const companyService = {
    async listCompanies(tenantId: string, params: PaginationParams) {
        const page = Math.max(params.page ?? 1, 1);
        const limit = Math.min(Math.max(params.limit ?? 8, 1), 100);
        const search = params.search?.trim() || undefined;

        const redisKey = `company-list-${tenantId}:p${page}:l${limit}:s${search ?? ""}`;

        const res = await cacheQuery(redisKey, 400, async () => {
            return prisma.$transaction(async (tx) => {
                return companyRepository.findManyCompanies(tx, tenantId, params);
            });
        });

        return attachPresignedLogo(res);
    },

    async findCompany(tenantId: string, id: string) {
        const redisKey = `company-get-${tenantId}-${id}`;
        const company = await cacheQuery(redisKey, 200, async () => {
            const result = await prisma.$transaction(async (tx) => {
                return companyRepository.findCompany(tx, tenantId, id);
            });
            if (!result) throw ApiError.notFound('Company not found');
            return result;
        });

        return attachPresignedLogo(company);
    },

    async ownCompany(tenantId: string, userId: string) {
        const redisKey = `company-get-${tenantId}-${userId}`;
        const userCompany = await cacheQuery(redisKey, 200, async () => {
            const result = await prisma.$transaction(async (tx) => {
                return companyRepository.findOwnCompany(tx, tenantId, userId);
            });
            if (!result) throw ApiError.notFound('Company not found');
            return result;
        });

        return attachPresignedLogo(userCompany);
    },

    async uploadCompanyLogo(tenantId: string, companyId: string, file: Express.Multer.File) {
        const company = await prisma.company.findFirst({
            where: { id: companyId, tenant_id: tenantId },
        });
        if (!company) throw ApiError.notFound('Company not found');

        const fileKey = await mediaRepository.uploadFileToS3(file, `company-logo/${tenantId}`);

        if (company.logo_url) {
            await mediaRepository.deleteFileFromS3(company.logo_url);
        }

        const updatedCompany = await prisma.company.update({
            where: { id: companyId },
            data: { logo_url: fileKey },
        });

        await Promise.all([
            redisService.deleteByPattern(`company-get-${tenantId}-*`),
            redisService.deleteByPattern(`company-list-${tenantId}-*`),
            redisService.deleteByPattern(`company-filter-${tenantId}-*`),
        ]);

        const logoUrl = await generateImageUrl(fileKey);
        return {
            company: updatedCompany,
            logo_url: fileKey,
            logoUrl,
        };
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
        ]);
        return companty;
    },

    async filterCompany(tenantId: string, filters: any) {
        const filterCompany = `company-filter-${tenantId}-${JSON.stringify(filters)}`;
        const list = await cacheQuery(filterCompany, 300, async () => {
            const company = await prisma.$transaction(async (tx) => {
                return companyRepository.filterCompany(tx, tenantId, filters);
            });
            if (!company || company.length === 0) throw ApiError.notFound('No companies found');
            return company;
        });

        if (Array.isArray(list)) {
            return Promise.all(
                list.map(async (c: any) => ({
                    ...c,
                    logoUrl: c.logo_url ? await generateImageUrl(c.logo_url) : null,
                }))
            );
        }
        return list;
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
            redisService.deleteByPattern(`lead-get-${tenantId}-*`),
            redisService.deleteByPattern(`lead-list-${tenantId}-*`),
            redisService.deleteByPattern(`lead-filter-${tenantId}-*`),
        ]);

        return attachPresignedLogo(company);
    },
};