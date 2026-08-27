import { z } from "zod";

export const ProjectStatusEnum = z.enum(["NOT_STARTED","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED",
]);

export const SourceEnum = z.enum(["WEBSITE","REFERAL","SOCIAL_MEDIA","EVENT","WEBINAR","OTHER",
]);


export const createProjectClientSchema = z
  .object({
    companyId: z.string().cuid().optional(),
    contactId: z.string().cuid().optional(),
    company_name: z.string().trim().min(1, "Company name is required"),
    source: SourceEnum.default("OTHER"),
    first_name: z.string().trim().min(1, "First name is required").optional(),
    last_name: z.string().trim().optional(),
    contact_email: z.string().trim().email("Invalid email").optional(),
    contact_phone: z.string().trim().min(1).optional(),
    designation: z.string().trim().optional(),
    project_name: z.string().trim().min(1, "Project name is required"),
    project_type: z.string().trim().max(100).optional(),
    status: ProjectStatusEnum.default("NOT_STARTED"),
    start_date: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
    budget: z.coerce.number().nonnegative("Budget cannot be negative").optional(),
    owner_id: z.string().cuid().optional(),
  })
  .refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    { message: "Due date cannot be earlier than start date", path: ["due_date"] },
  );

export type CreateProjectFormValues = z.infer<typeof createProjectClientSchema>;

export const convertLeadToProjectClientSchema = z
  .object({
    lead_id: z.string().cuid("Invalid lead id"),
    owner_id: z.string().cuid().optional(),
    start_date: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
    budget: z.coerce.number().nonnegative("Budget cannot be negative").optional(),
  })
  .refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    { message: "Due date cannot be earlier than start date", path: ["due_date"] },
  );

export type ConvertLeadToProjectFormValues = z.infer<typeof convertLeadToProjectClientSchema>;


export const updateProjectClientSchema = z
  .object({
    project_name: z.string().trim().min(1).optional(),
    project_type: z.string().trim().max(100).optional(),
    status: ProjectStatusEnum.optional(),
    start_date: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
    budget: z.coerce.number().nonnegative().optional(),
    owner_id: z.string().cuid().optional(),
  })
  .refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    { message: "Due date cannot be earlier than start date", path: ["due_date"] },
  );

export type UpdateProjectFormValues = z.infer<typeof updateProjectClientSchema>;

export const listProjectsFilterSchema = z.object({
  status: ProjectStatusEnum.optional(),
  companyId: z.string().cuid().optional(),
  owner_id: z.string().cuid().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListProjectsFilterValues = z.infer<typeof listProjectsFilterSchema>;