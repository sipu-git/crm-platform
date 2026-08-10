import { z } from "zod";
import { CompanySize, CompanyStatus } from "../../../generated/prisma/enums";

const addressFields = {
  address_line1: z.string().trim().optional(),
  address_line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
};

const websiteSchema = z
  .object({
    url: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).partial();

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters"),
  legal_name: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  size: z.enum(CompanySize).optional(),
  annual_revenue: z.coerce.number().nonnegative().optional(),
  company_status: z.enum(CompanyStatus).optional().default("ACTIVE"),

  website: z.string().trim().url("Invalid website URL").optional(),
  email: z.string().trim().email("Invalid email").optional(),
  phone: z.string().trim().optional(),
  ...addressFields,
  source: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
  owner_name: z.string(),
});

export const updateCompanySchema = createCompanySchema.partial()

export const filterCompanySchema = z.object({
  company: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  size: z.enum(CompanySize).optional(),
  company_status: z.enum(CompanyStatus).optional(),
  owner_id: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

export type CreateCompanyBody = z.infer<typeof createCompanySchema>;
export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;
export type FilterCompanyQuery = z.infer<typeof filterCompanySchema>;