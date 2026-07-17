import { z } from 'zod';
import { LeadStatus, Source } from '../../../generated/prisma/enums';

export const createLeadSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string("Phone number is required").min(1),
  source: z.enum(Source).default(Source.OTHER),
  company_name: z.string().min(1),
  companyId: z.string().min(1),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED']),
});

export const leadFiltersSchema = z.object({
  status: z.string().optional(),
  source:z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
