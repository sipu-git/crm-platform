import { companyRepository } from "./company.repository";
import { ApiError } from "../../shared/utils/ApiError";
export const companyService = {
    async create(tenantId, data) {
        const existing = await companyRepository.findCompany(tenantId, data.name);
        if (existing) {
            throw ApiError.badRequest("Company already exists") || new Error("Company already exists");
        }
        return await companyRepository.create(tenantId, data);
    },
    listCompanies(tenantId) {
        const existing = companyRepository.findManyCompanies(tenantId);
        if (!existing)
            throw ApiError.notFound("No companies found");
        return existing;
    },
    findCompany(tenantId, id) {
        const existing = companyRepository.findCompany(tenantId, id);
        if (!existing)
            throw ApiError.notFound("Company not found");
        return companyRepository.findCompany(tenantId, id);
    },
    deleteCompany(tenantId, id) {
        const existing = companyRepository.findCompany(tenantId, id);
        if (!existing)
            throw ApiError.notFound("Company not found");
        return companyRepository.delete(tenantId, id);
    },
    filterCompany(tenantId, filters) {
        return companyRepository.filterCompany(tenantId, filters);
    },
    modify(tenantId, id, data) {
        const existing = companyRepository.findCompany(tenantId, id);
        if (!existing)
            throw ApiError.notFound("Company not found");
        return companyRepository.modify(tenantId, id, data);
    }
};
