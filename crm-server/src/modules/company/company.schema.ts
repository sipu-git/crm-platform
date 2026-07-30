import { z } from "zod";

const websiteSchema = z
  .object({
    url: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).partial();

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters"),
  industry: z.string().trim().optional(),
  website: websiteSchema.optional(),
});

export const updateCompanySchema = createCompanySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const filterCompanySchema = z.object({
  company: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

export type CreateCompanyBody = z.infer<typeof createCompanySchema>;
export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;
export type FilterCompanyQuery = z.infer<typeof filterCompanySchema>;