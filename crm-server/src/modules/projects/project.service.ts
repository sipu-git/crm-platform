import { prisma } from "../../../lib/prisma.js";
import { projectRepository } from "./projects.repository.js";
import { ConvertLeadToProjectInput, UpdateProjectInput } from "./projects.schema.js";
import { LeadStatus, ProjectStatus } from "../../../generated/prisma/enums.js";
import redisService from '../../shared/redis/caching.js';
import { companyContactResolver } from './utils/resolver.util.js';
import { leadsRepository } from "../lead/repository/lead.repository.js";
import { cacheQuery } from "../../shared/redis/query.js";
import { eventBus } from "../../shared/event-bus/index.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { CreateProjectData } from "./project.types.js";
import { parseBudgetToDecimal } from "./utils/parseBudgets.js";
import { Deal } from "../../../generated/prisma/client.js";

export const projectService = {
    async convertWonDeal(tx: any, tenantId: string, dealId: string) {
        const deal = await tx.deal.findFirst({
            where: { id: dealId, tenant_id: tenantId },
            include: { leads: true, contact: true },
        });
        if (!deal) throw new Error('Deal not found');

        const existing = await tx.project.findFirst({
            where: { tenant_id: tenantId, OR: [{ originating_deal_id: deal.id }, { originating_lead_id: deal.lead_id }] },
        });
        if (existing) return existing;

        const project = await tx.project.create({
            data: {
                tenant_id: tenantId,
                companyId: deal.leads.companyId,
                contact_id: deal.contact_id,
                status: ProjectStatus.IN_PROGRESS,
                originating_lead_id: deal.lead_id,
                originating_deal_id: deal.id,
            },
        });

        const client = deal.contact.email
            ? await tx.user.findFirst({ where: { tenantId, email: deal.contact.email, role: 'CLIENT' } })
            : null;
        if (client) {
            await tx.projectMember.upsert({
                where: { project_id_user_id: { project_id: project.id, user_id: client.id } },
                create: { tenant_id: tenantId, project_id: project.id, user_id: client.id },
                update: {},
            });
        }
        return project;
    },

    async createProject({ tenantId, companyId, contactId, ownerId, leadId, enquiryId, creatorId, contactInput, data }: CreateProjectData) {
        if (!tenantId) throw ApiError.badRequest('tenantId is required');

        let resolvedLeadId = leadId;
        let isNewLead = false;
        let updatedDeal: Deal | null = null;

        const project = await prisma.$transaction(async (tx) => {
            const company = await companyContactResolver.resolveCompany(
                tx,
                tenantId,
                undefined,
                companyId,
                data.company_name,
                data.source
            );

            const contact = await companyContactResolver.resolveContact(
                tx,
                tenantId,
                creatorId,
                company.id,
                contactId,
                contactInput ?? {}
            );

            const lead = leadId ? await leadsRepository.findById(tx, tenantId, leadId) : null;

            if (!lead) {
                const newLead = await leadsRepository.create(tx, tenantId, company.id, contact.id, creatorId, {
                    company_name: data.company_name,
                    project_name: data.project_name || "New Project",
                    ...(data.project_type ? { project_type: data.project_type as any } : {}),
                    source: data.source,
                    status: LeadStatus.NEW,
                });
                resolvedLeadId = newLead.id;
                isNewLead = true;
            }

            const projectPayload: any = {
                ...(data.status ? { status: data.status } : {}),
                ...(enquiryId ? { enquiry_id: enquiryId } : {}),
            };
            const newProject = projectRepository.create(
                tx,
                tenantId,
                company.id,
                ownerId,
                resolvedLeadId!,
                contact.id,
                projectPayload
            );

            if (enquiryId) {
                const enquiry = await tx.enquiry.findUnique({
                    where: { id: enquiryId },
                    select: { budget: true },
                });

                const amount = parseBudgetToDecimal(enquiry?.budget);

                if (amount !== null) {
                    const deal = await tx.deal.findFirst({
                        where: { tenant_id: tenantId, lead_id: resolvedLeadId },
                        orderBy: { created_at: 'desc' },
                    });

                    if (deal) {
                        updatedDeal = await tx.deal.update({
                            where: { id: deal.id },
                            data: { amount },
                        });
                    }
                }
            }
            return newProject;
        });

        if (isNewLead) {
            eventBus.emit('lead.created', { tenantId, lead_id: resolvedLeadId });
        }
        eventBus.emit('project.created', { tenantId, project_id: project.id, lead_id: resolvedLeadId });

        await Promise.all([
            redisService.deleteByPattern(`lead-get-${tenantId}-*`),
            redisService.deleteByPattern(`lead-list-${tenantId}-*`),
            redisService.deleteByPattern(`company-list-${tenantId}-*`),
            redisService.deleteByPattern(`contact-list-${tenantId}-*`),
            redisService.deleteByPattern(`communications-${tenantId}-*`),
            redisService.deleteByPattern(`project-list-${tenantId}-*`),
            redisService.deleteByPattern(`project-${tenantId}-*`),
            redisService.delete(`project-all-${tenantId}`),
        ]);

        return project;
    },

    async convertLeadToProject(tenantId: string, input: ConvertLeadToProjectInput) {
        return prisma.$transaction(async (tx) => {
            const lead = await leadsRepository.findById(tx, tenantId, input.lead_id);
            if (!lead) throw new Error("Lead not found");
            const deal = await tx.deal.findFirst({
                where: { tenant_id: tenantId, lead_id: lead.id },
                include: { pipeline: true },
            });
            if (!deal?.pipeline.is_won) throw new Error("A project can only be created after the deal is WON");
            return this.convertWonDeal(tx, tenantId, deal.id);
        });
    },

    async viewOwnProjects(userId: string) {
        const cacheKey = `project-list-${userId}`;
        return cacheQuery(cacheKey, 200, async () => {
            const projects = await prisma.$transaction(async (tx) => {
                return projectRepository.findOwnProjects(tx, userId);
            });
            return projects;
        });
    },

    async viewProject(tenantId: string, id: string) {
        const cacheKey = `project-${tenantId}-${id}`;
        return cacheQuery(cacheKey, 200, async () => {
            const project = await prisma.$transaction(async (tx) => {
                return projectRepository.findProject(tx, tenantId, id);
            });
            return project;
        });
    },

    async viewAllProjects(tenantId: string) {
        const cacheKey = `project-all-${tenantId}`;
        return cacheQuery(cacheKey, 200, async () => {
            const projects = await prisma.$transaction(async (tx) => {
                return projectRepository.findAllProjects(tx, tenantId);
            });
            return projects;
        });
    },

    async modifyProject(tenantId: string, id: string, data: UpdateProjectInput) {
        return prisma.$transaction(async (tx) => {
            return projectRepository.modifyProject(tx, tenantId, id, data);
        });
    },
};
