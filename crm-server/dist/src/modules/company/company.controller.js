import { updateCompanySchema } from "./company.schema.js";
import { companyService } from "./company.service.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";
export const companyController = {
    async getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Company id is required' });
        }
        const lead = await companyService.findCompany(req.tenantId, id);
        return res.status(200).json(successResponse("company found successfully", lead));
    },
    // async create(req: Request, res: Response) {
    //     const input = createCompanySchema.parse(req.body);
    //     const company = await companyService.create(req.tenantId! , input);
    //     return res.status(201).json(successResponse("company created successfully", company));
    // },
    async viewListCompanies(req, res) {
        const companies = await companyService.listCompanies(req.tenantId);
        return res.status(200).json(successResponse("companies found successfully", companies));
    },
    async getByCompanyId(req, res) {
        const companyId = req.params.companyId;
        const company = await companyService.findCompany(req.tenantId, companyId);
        return res.status(200).json(successResponse("company found successfully", company));
    },
    async update(req, res) {
        const input = updateCompanySchema.parse(req.body);
        const id = req.params.id;
        const company = await companyService.modify(req.tenantId, id, input);
        return res.status(200).json(successResponse("company updated successfully", company));
    },
    async delete(req, res) {
        const id = req.params.id;
        const company = await companyService.deleteCompany(req.tenantId, id);
        return res.status(200).json(successResponse("company deleted successfully", company));
    },
    async filters(req, res) {
        const filters = req.query;
        const companies = await companyService.filterCompany(req.tenantId, filters);
        return res.status(200).json(successResponse("companies found successfully", companies));
    },
};
