import { z } from 'zod';
import { LeadStatus, Source } from '../../../generated/prisma/enums.js';

export const createLeadSchema = z.object({
  source: z.enum(Source).default(Source.OTHER),
  project_name: z.string().min(1),
  project_type: z.string().optional(),
  company_name: z.string().min(1),
  status: z.enum(LeadStatus).default(LeadStatus.NEW),
  assigned_to: z.string().cuid().optional()
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


export const updateLeadSchema = createLeadSchema.partial()

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
