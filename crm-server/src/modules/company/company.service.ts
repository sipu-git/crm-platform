import { CreateCompanyBody } from "./company.schema";
import { companyRepository } from "./company.repository";
import { ApiError } from "../../shared/utils/ApiError";

export const companyService = {
    async create(tenantId: string, data: CreateCompanyBody) {
        const existing = await companyRepository.findCompany(tenantId, data.name);
        if (existing) {
            throw ApiError.badRequest("Company already exists") || new Error("Company already exists");
        }
        return await companyRepository.create(tenantId, data);
    },
    listCompanies(tenantId: string) {
        const existing = companyRepository.findManyCompanies(tenantId);
        if(!existing) throw ApiError.notFound("No companies found");
        return existing;
    },
    findCompany(tenantId: string, id: string) {
        const existing = companyRepository.findCompany(tenantId, id);
        if(!existing) throw ApiError.notFound("Company not found");
        return companyRepository.findCompany(tenantId, id);
    },
    deleteCompany(tenantId: string, id: string) {
        const existing = companyRepository.findCompany(tenantId, id);
        if(!existing) throw ApiError.notFound("Company not found");
        return companyRepository.delete(tenantId, id);
    },
    filterCompany(tenantId: string, filters: any) {
        return companyRepository.filterCompany(tenantId, filters);
    },
    modify(tenantId: string, id: string, data: any) {
        const existing = companyRepository.findCompany(tenantId, id);
        if(!existing) throw ApiError.notFound("Company not found");
        return companyRepository.modify(tenantId, id, data);
    }
};