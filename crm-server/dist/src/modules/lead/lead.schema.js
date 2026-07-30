import { z } from 'zod';
import { LeadStatus, Source } from '../../../generated/prisma/enums.js';
export const createLeadSchema = z.object({
    full_name: z.string().min(1),
    source: z.enum(Source).default(Source.OTHER),
    company_name: z.string().min(1),
    designation: z.string("The designation field is required!")
});
export const updateLeadStatusSchema = z.object({
    status: z.enum(LeadStatus)
});
export const leadFiltersSchema = z.object({
    status: z.string().optional(),
    source: z.string().optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
});
export const updateLeadSchema = z.object({
    full_name: z.string().min(1).optional(),
    company_name: z.string().min(1).optional(),
    designation: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    source: z.enum(Source).optional(),
    status: z.enum(LeadStatus).optional()
});
