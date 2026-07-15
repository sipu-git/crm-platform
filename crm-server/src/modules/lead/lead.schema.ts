import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().min(1),
  assignedTo: z.string().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED']),
});

export const leadFiltersSchema = z.object({
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
