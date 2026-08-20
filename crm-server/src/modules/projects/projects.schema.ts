import { z } from "zod";
import { ProjectStatus, Source } from "../../../generated/prisma/enums";

const phoneRegex = /^[+]?[0-9][0-9\s\-()]{6,20}$/;

const projectSchema = z.object({
    company_name: z.string().trim().min(1, "Company name is required").max(200),
    first_name: z.string().trim().min(1).max(150),
    last_name: z.string().trim().min(1).max(150),
    contact_email: z.string().trim().email("Invalid email").max(254),
    contact_phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
    project_name: z.string().trim().min(1, "Project name is required").max(200),
    designation: z.string().trim().min(1, "Designation is required").max(200),
    source: z.enum(Source).default("WEBSITE"),
    description: z.string().trim().max(1000).optional(),
    project_type: z.string().trim().max(100).optional(),
    status: z.enum(ProjectStatus).default("ON_HOLD"),
    start_date: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
    budget: z.number().nonnegative("Budget cannot be negative").optional(),
})

export const createProjectSchema = projectSchema.refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    { message: "due_date cannot be earlier than start_date", path: ["due_date"] },
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const convertLeadToProjectSchema = z.object({
    lead_id: z.string(),
    owner_id: z.string().cuid().optional(),
    start_date: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
    budget: z.number().nonnegative().optional(),
})
    .refine(
        (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
        { message: "due_date cannot be earlier than start_date", path: ["due_date"] },
    );

export type ConvertLeadToProjectInput = z.infer<typeof convertLeadToProjectSchema>;

export const updateProjectSchema = projectSchema.partial().refine(
    (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
    { message: "due_date cannot be earlier than start_date", path: ["due_date"] },
);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;


export const listProjectsQuerySchema = z.object({
    status: z.enum(ProjectStatus).optional(),
    search: z.string().trim().max(200).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export const projectIdParamSchema = z.object({
    id: z.string().cuid(),
});