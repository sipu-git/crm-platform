import { Request, Response } from "express";
import { createCompanySchema, updateCompanySchema } from "./company.schema";
import { companyService } from "./company.service";
import { successResponse } from "../../shared/utils/ApiResponse";


export const companyController = {
    async getById(req: Request, res: Response) {
        const id = req.params.id as any;
        if (!id) {
          return res.status(400).json({ message: 'Company id is required' });
        }
        const lead = await companyService.findCompany(req.tenantId!, id);
        return res.status(200).json(successResponse("company found successfully", lead));
      },
    
    async create(req: Request, res: Response) {
        const input = createCompanySchema.parse(req.body);
        const company = await companyService.create(req.tenantId! , input);
        return res.status(201).json(successResponse("company created successfully", company));
    },
    async viewListCompanies(req: Request, res: Response) {
        const companies = await companyService.listCompanies(req.tenantId!);
        return res.status(200).json(successResponse("companies found successfully", companies));
    },
  async getByCompanyId(req: Request, res: Response) {
    const companyId = req.params.companyId as any;
    const company = await companyService.findCompany(req.tenantId!,companyId);
    return res.status(200).json(successResponse("company found successfully", company));
  },

  async update(req: Request, res: Response) {
    const input = updateCompanySchema.parse(req.body);
    const id = req.params.id as any;
    const company = await companyService.modify(req.tenantId!, id, input);
    return res.status(200).json(successResponse("company updated successfully", company));
  },
  async delete(req: Request, res: Response) {
    const id = req.params.id as any;
    const company = await companyService.deleteCompany(req.tenantId!, id);
    return res.status(200).json(successResponse("company deleted successfully", company));
  },
  async filters(req: Request, res: Response) {
    const filters = req.query;
    const companies = await companyService.filterCompany(req.tenantId!, filters);
    return res.status(200).json(successResponse("companies found successfully", companies));
  },
}; 
