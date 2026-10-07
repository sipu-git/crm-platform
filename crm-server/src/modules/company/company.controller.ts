import { Request, Response } from "express";
import { createCompanySchema, updateCompanySchema } from "./company.schema.js";
import { companyService } from "./company.service.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";

export const companyController = {
  async getById(req: Request, res: Response) {
    const id = req.params.id as any;
    if (!id) {
      return res.status(400).json({ message: 'Company id is required' });
    }
    const lead = await companyService.findCompany(req.tenantId!, id);
    return res.status(200).json(successResponse("company found successfully", lead));
  },

  async viewListCompanies(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = req.query.search as string | undefined;
    const companies = await companyService.listCompanies(req.tenantId!, { page, limit, search });
    return res.status(200).json(successResponse("companies found successfully", companies));
  },
  
  async getByCompanyId(req: Request, res: Response) {
    const companyId = req.params.companyId as any;
    const company = await companyService.findCompany(req.tenantId!, companyId);
    return res.status(200).json(successResponse("company found successfully", company));
  },

  async getOwnCompany(req: Request, res: Response) {
    const company = await companyService.ownCompany(req.auth?.tenantId!, req.auth?.userId!);
    return res.status(200).json(successResponse("company fetched successfully", company));
  },

  async update(req: Request, res: Response) {
    const input = updateCompanySchema.parse(req.body);
    const company = await companyService.modify(req.auth?.tenantId!, req.auth?.companyId!, input);
    return res.status(200).json(successResponse("company updated successfully", company));
  },

  async uploadLogo(req: Request, res: Response) {
    const tenantId = (req.tenantId || req.auth?.tenantId) as string;
    const companyId = (req.params.id || req.auth?.companyId) as string;
    if (!tenantId || !companyId) {
      return res.status(400).json({ success: false, message: "Tenant ID and Company ID are required" });
    }
    const file = req.file || (req.files && (req.files as any)[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: "Company logo file is required" });
    }
    const result = await companyService.uploadCompanyLogo(tenantId, companyId, file);
    return res.status(200).json(successResponse("Company logo uploaded successfully", result));
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
