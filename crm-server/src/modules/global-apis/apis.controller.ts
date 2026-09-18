import { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/ApiResponse.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { apiService, SearchType } from './apis.service.js';
import { GlobalSearchFilters } from './apis.types.js';

export const searchController = {
  async search(req: Request, res: Response) {
    const q = (req.query.q as string | undefined)?.trim();
    const typeParam = req.query.type as string | undefined;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 50) : 5;

    const company_name = (req.query.company_name as string | undefined)?.trim();
    const project_name = (req.query.project_name as string | undefined)?.trim();
    const first_name = (req.query.first_name as string | undefined)?.trim();
    const last_name = (req.query.last_name as string | undefined)?.trim();
    const email = (req.query.email as string | undefined)?.trim();
    const title = (req.query.title as string | undefined)?.trim();
    const invoice_number = (req.query.invoice_number as string | undefined)?.trim();
    const buyer_name = (req.query.buyer_name as string | undefined)?.trim();
    const gstnumber = ((req.query.gstnumber || req.query.gst_number) as string | undefined)?.trim();

    const hasSpecificFilter = Boolean(
      company_name || project_name || first_name || last_name || email || title || invoice_number || buyer_name || gstnumber
    );

    if (!q && !hasSpecificFilter) {
      throw new ApiError(400, 'Please provide a search query (q) or at least one specific filter parameter');
    }

    if (q && q.length < 2 && !hasSpecificFilter) {
      throw new ApiError(400, 'Query must be at least 2 characters');
    }

    const types = typeParam? (typeParam.split(',').map((t) => t.trim().toLowerCase()).filter((t) => ['lead', 'deal', 'invoice'].includes(t)) as SearchType[]): [];

    const filters: GlobalSearchFilters = {
      q,
      types: types.length ? types : undefined,
      limit,
      company_name,
      project_name,
      first_name,
      last_name,
      email,
      title,
      invoice_number,
      buyer_name,
      gstnumber,
    };

    const tenantId = req.auth?.tenantId || req.tenantId!;
    const result = await apiService.search(tenantId, filters);
    return res.status(200).json(successResponse('Search results fetched successfully', result));
  },
};