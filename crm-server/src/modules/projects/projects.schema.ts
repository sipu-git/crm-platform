import { z } from "zod";
import { ProjectStatus, ProjectType, Source } from "../../../generated/prisma/enums.js";

const phoneRegex = /^[+]?[0-9][0-9\s\-()]{6,20}$/;

export const createProjectSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required"),
  project_name: z.string().trim().nullable().optional().default(null),
  project_type: z.enum(ProjectType).nullable().optional().default(null),
  source: z.enum(Source),
  description: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  status: z.enum(ProjectStatus).optional().default("ON_HOLD"),
});


export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const convertLeadToProjectSchema = z.object({
    lead_id: z.string(),
    owner_id: z.string().cuid().optional(),
    timeline: z.coerce.date().optional(),
    budget: z.number().nonnegative().optional(),
})
export const updateProjectSchema = createProjectSchema.partial();

export type ConvertLeadToProjectInput = z.infer<typeof convertLeadToProjectSchema>;

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