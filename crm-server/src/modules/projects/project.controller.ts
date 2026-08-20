import { Request, Response } from "express";
import { convertLeadToProjectSchema, createProjectSchema } from "./projects.schema";
import { projectService } from "./project.service";
import { errorResponse, successResponse } from "../../shared/utils/ApiResponse";
import { ApiError } from "../../shared/utils/ApiError";

function getId(req: Request): string {
    const { id } = req.params;
    if (typeof id !== 'string') throw ApiError.notFound('Contact not found');
    return id;
}

export const projectController = {
    createProject: async (req: Request, res: Response) => {
        // if (!req.auth?.tenantId || !req.auth?.userId) {
        //     return res.status(401).json(errorResponse("Not authenticated"));
        // }
        const parsed = createProjectSchema.parse(req.body);
        const { companyId, contactId, leadId, ownerId } = req.body;

        const response = await projectService.createProject(req.tenantId!, companyId, ownerId, leadId, req.auth?.userId!, contactId, parsed);
        return res.status(201).json(successResponse("Project created successfully", response));
    },
    convertLead: async (req: Request, res: Response) => {
        const parsed = convertLeadToProjectSchema.parse(req.body);
        const response = await projectService.convertLeadToProject(req.tenantId!, req.auth?.userId!, parsed);
        return res.status(201).json(successResponse("Project created successfully", response));
    },
    find: async (req: Request, res: Response) => {
        const response = await projectService.viewProject(req.tenantId!, getId(req));
        return res.status(200).json(successResponse("Project found successfully", response));
    },
    update: async (req: Request, res: Response) => {
        const parsed = createProjectSchema.parse(req.body);
        const response = await projectService.modifyProject(req.tenantId!, getId(req), parsed);
        return res.status(200).json(successResponse("Project updated successfully", response));
    }
}