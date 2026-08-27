import { prisma } from "../../../lib/prisma";
import { projectRepository } from "./projects.repository";
import { ConvertLeadToProjectInput, CreateProjectInput, UpdateProjectInput } from "./projects.schema";
import { LeadStatus, ProjectStatus } from "../../../generated/prisma/enums";
import redisService from '../../shared/redis/caching';
import { companyContactResolver } from './resolver.util';
import { eventBus } from "../../shared/event-bus";
import { leadsRepository } from "../lead/repository/lead.repository";

export const projectService = {
    async createProject(tenantId: string, companyId: string, ownerId: string, lead_id: string,
        creator: string, contactId: string, data: CreateProjectInput) {

        let resolvedLeadId = lead_id;
        let isNewLead = false;

        const project = await prisma.$transaction(async (tx) => {
            const company = await companyContactResolver.resolveCompany(tx, tenantId, creator, companyId, data.company_name, data.source);
            const contact = await companyContactResolver.resolveContact(tx, tenantId, creator, company.id, contactId, {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.contact_email,
                phone: data.contact_phone,
                designation: data.designation,
            });

            const lead = lead_id ? await leadsRepository.findById(tx, tenantId, lead_id) : null;

            if (!lead) {
                const newLead = await leadsRepository.create(tx, tenantId, company.id, contact.id, creator, {
                    company_name: data.company_name,
                    project_name: data.project_name,
                    project_type: data.project_type,
                    source: data.source,
                    status: LeadStatus.NEW,
                });
                resolvedLeadId = newLead.id;
                isNewLead = true;
            }

            return projectRepository.create(tx, tenantId, company.id, ownerId, resolvedLeadId, contact.id, creator, data);
        });

        if (isNewLead) {
            eventBus.emit("lead.created", { tenantId, lead_id: resolvedLeadId });
        }
        eventBus.emit("project.created", { tenantId, project_id: project.id, lead_id: resolvedLeadId });

        await Promise.all([
            redisService.deleteByPattern(`lead-get-${tenantId}-*`),
            redisService.deleteByPattern(`lead-list-${tenantId}-*`),
            redisService.deleteByPattern(`company-list-${tenantId}-*`),
            redisService.deleteByPattern(`contact-list-${tenantId}-*`),
            redisService.deleteByPattern(`communications-${tenantId}-*`),
            redisService.deleteByPattern(`project-list-${tenantId}-*`),
        ]);

        return project;
    },
    async convertLeadToProject(tenantId: string, creator: string, input: ConvertLeadToProjectInput) {
        return prisma.$transaction(async (tx) => {
            const lead = await leadsRepository.findById(tx, tenantId, input.lead_id);
            if (!lead) throw new Error("Lead not found");

            return projectRepository.create(
                tx, tenantId, lead.companyId, input.owner_id ?? lead.assigned_to ?? creator,
                lead.id, lead.contactId, creator,
                {
                    company_name: lead.company_name,
                    project_name: lead.project_name,
                    project_type: lead.project_type ?? undefined,
                    source: lead.source,
                    status: ProjectStatus.IN_PROGRESS,
                    start_date: input.start_date,
                    due_date: input.due_date,
                    budget: input.budget,
                },
            );
        });
    },
    
    async viewOwnProject(tenantId: string, creator: string) {
        return prisma.$transaction(async (tx) => {
            return projectRepository.findOwnProject(tx, tenantId, creator);
        })
    },

    async viewProject(tenantId: string, id: string) {
        return prisma.$transaction(async (tx) => {
            return projectRepository.findProject(tx, tenantId, id);
        });
    },
    async modifyProject(tenantId: string, id: string, data: UpdateProjectInput) {
        return prisma.$transaction(async (tx) => {
            return projectRepository.modifyProject(tx, tenantId, id, data);
        });
    },
}