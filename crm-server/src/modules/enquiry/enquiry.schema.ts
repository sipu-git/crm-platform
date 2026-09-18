import { z } from 'zod';
import { ProjectType, Source } from '../../../generated/prisma/enums';

export const enquirySchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  first_name: z.string().trim().min(1).max(150),
  last_name: z.string().trim().max(150).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(30).optional(),
  designation: z.string().trim().max(200).optional(),
  project_name: z.string().trim().min(1).max(200),
  project_type: z.enum(ProjectType).optional(),
  source: z.enum(Source).default('WEBSITE'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().min(1).max(400).optional()
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

