import { Request, Response } from "express";
import { convertLeadToProjectSchema, createProjectSchema } from "./projects.schema.js";
import { projectService } from "./project.service.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";
import { ApiError } from "../../shared/utils/ApiError.js";

function getId(req: Request): string {
    const { id } = req.params;
    if (typeof id !== 'string') throw ApiError.notFound('Project not found');
    return id;
}

export const projectController = {
    createProject: async (req: Request, res: Response) => {
        const parsed = createProjectSchema.parse(req.body);
        const { companyId, contactId, leadId, ownerId } = req.body;

        const response = await projectService.createProject({
            tenantId: req.auth?.tenantId!,
            creatorId: req.auth?.userId!,
            companyId,
            ownerId,
            leadId,
            contactId,
            data: parsed,
        });
        return res.status(201).json(successResponse("Project created successfully", response));
    },
    convertLead: async (req: Request, res: Response) => {
        const parsed = convertLeadToProjectSchema.parse(req.body);
        const response = await projectService.convertLeadToProject(req.tenantId!, parsed);
        return res.status(201).json(successResponse("Project created successfully", response));
    },
    find: async (req: Request, res: Response) => {
        const response = await projectService.viewProject(req.tenantId!, getId(req));
        return res.status(200).json(successResponse("Project found successfully", response));
    },
    findOwnProjects: async (req: Request, res: Response) => {
        if (!req.auth) throw ApiError.unauthorized('Not authenticated');
        const response = await projectService.viewOwnProjects(req.auth.tenantId, req.auth.userId!);
        return res.status(200).json(successResponse("Project found successfully", response));
    },
    findOwnProjectById: async (req: Request, res: Response) => {
        if (!req.auth) throw ApiError.unauthorized('Not authenticated');
        const response = await projectService.viewOwnProject(req.auth.tenantId, req.auth.userId!, getId(req));
        return res.status(200).json(successResponse("Project found successfully", response));
    },
    findAllProjects: async (req: Request, res: Response) => {
        const response = await projectService.viewAllProjects(req.auth?.tenantId!);
        return res.status(200).json(successResponse("Projects found successfully", response));
    },
    update: async (req: Request, res: Response) => {
        const parsed = createProjectSchema.parse(req.body);
        const response = await projectService.modifyProject(req.tenantId!, getId(req), parsed);
        return res.status(200).json(successResponse("Project updated successfully", response));
    },
};
