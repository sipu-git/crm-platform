import { companyRepository } from "./company.repository.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { prisma } from "../../../lib/prisma.js";
export const companyService = {
    async listCompanies(tenantId) {
        const company = await prisma.$transaction(async (tx) => {
            return companyRepository.findManyCompanies(tx, tenantId);
        });
        if (!company || company.length === 0)
            throw ApiError.notFound('No companies found');
        return company;
    },
    async findCompany(tenantId, id) {
        const company = await prisma.$transaction(async (tx) => {
            return companyRepository.findCompany(tx, tenantId, id);
        });
        if (!company)
            throw ApiError.notFound('Company not found');
        return company;
    },
    async deleteCompany(tenantId, id) {
        const companty = await prisma.$transaction(async (tx) => {
            return companyRepository.delete(tx, tenantId, id);
        });
        if (!companty)
            throw ApiError.notFound('Company not found');
        return companty;
    },
    async filterCompany(tenantId, filters) {
        const company = await prisma.$transaction(async (tx) => {
            return companyRepository.filterCompany(tx, tenantId, filters);
        });
        if (!company || company.length === 0)
            throw ApiError.notFound('No companies found');
        return company;
    },
    async modify(tenantId, id, data) {
        const company = await prisma.$transaction(async (tx) => {
            return companyRepository.modify(tx, tenantId, id, data);
        });
        if (!company)
            throw ApiError.notFound('Company not found');
        return company;
    },
};
