// src/features/companies/company.schema.ts
import { z } from "zod";
import { companyValidationMessages as msg } from "@/features/companies/validate-messages";

export const CompanySize = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"] as const;
export type CompanySize = (typeof CompanySize)[number];

export const CompanyStatus = ["ACTIVE", "INACTIVE", "PROSPECT"] as const;
export type CompanyStatus = (typeof CompanyStatus)[number];

const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]{3,12}$/;

const addressFields = {
  address_line1: z.string().trim().max(160, msg.address_line1.max).optional(),
  address_line2: z.string().trim().max(160, msg.address_line2.max).optional(),
  city: z.string().trim().max(80, msg.city.max).optional(),
  state: z.string().trim().max(80, msg.state.max).optional(),
  country: z.string().trim().max(80, msg.country.max).optional(),
  postal_code: z.string().trim().regex(POSTAL_CODE_REGEX, msg.postal_code.invalid)
    .optional().or(z.literal("")),
};

export const createCompanySchema = z.object({
  name: z
    .string({ message: msg.name.required })
    .trim()
    .min(2, msg.name.min)
    .max(120, msg.name.max),
  legal_name: z.string().trim().max(160, msg.legal_name.max).optional(),
  // owner_name: z.string().trim().max(160, msg.owner_name.invalid),
  industry: z.string().trim().max(80, msg.industry.max).optional(),
  size: z.enum(CompanySize, { message: msg.size.invalid }).optional(),
  annual_revenue: z.coerce
    .number({ message: msg.annual_revenue.invalid })
    .nonnegative(msg.annual_revenue.negative)
    .max(1_000_000_000_000, msg.annual_revenue.max)
    .optional(),
  company_status: z
    .enum(CompanyStatus, { message: msg.company_status.invalid })
    .optional()
    .default("ACTIVE"),

  website: z
    .string()
    .trim()
    .url(msg.website.invalid)
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email(msg.email.invalid)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, msg.phone.invalid)
    .optional()
    .or(z.literal("")),

  ...addressFields,

  source: z.string().trim().max(80, msg.source.max).optional(),
  tags: z
    .array(z.string().trim().max(30, msg.tags.itemMax))
    .max(15, msg.tags.max)
    .optional(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: msg.form.atLeastOneField }
);

export type CreateCompanyBody = z.infer<typeof createCompanySchema>;
export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;