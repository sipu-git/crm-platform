import { ApiError } from '../../shared/utils/ApiError.js';
import { eventBus } from '../../shared/event-bus/index.js';
import { leadsRepository } from './lead.repository.js';
import { contactsRepository } from '../contact/contact.repository.js';
import { prisma } from '../../../lib/prisma.js';
import { companyRepository } from '../company/company.repository.js';
import { dealRepository } from '../deal/deal.repository.js';
import { pipelineRepository } from '../deal/pipeline.repository.js';
import { addDays } from 'date-fns';
import { assignRepository } from './lead-assignment/assign.repository.js';
export const leadService = {
    async list(tenantId, filters) {
        const leads = await prisma.$transaction(async (tx) => {
            return leadsRepository.findMany(tx, tenantId, filters);
        });
        if (!leads || leads.length === 0)
            throw ApiError.notFound('No leads found');
        return leads;
    },
    async getById(tenantId, id) {
        const lead = await prisma.$transaction(async (tx) => {
            return leadsRepository.findById(tx, tenantId, id);
        });
        if (!lead)
            throw ApiError.notFound('Lead not found');
        return lead;
    },
    async create(tenantId, userId, input) {
        const lead = await prisma.$transaction(async (tx) => {
            const company = await companyRepository.upsertStubByName(tx, tenantId, userId, input.company_name.trim(), input.source);
            const contact = await contactsRepository.create(tx, tenantId, userId, {
                companyId: company.id,
                firstName: input.first_name.trim(),
                lastName: input.last_name?.trim(),
                designation: input.designation,
                email: input.email,
                phone: input.phone,
            });
            return leadsRepository.create(tx, tenantId, company.id, contact.id, userId, input);
        });
        eventBus.emit("lead.created", { leadId: lead.id, tenantId });
        return lead;
    },
    async updateStatus(tenantId, id, status, actingUserId) {
        const result = await prisma.$transaction(async (tx) => {
            const lead = await leadsRepository.findById(tx, tenantId, id);
            if (!lead) {
                throw ApiError.notFound("Lead not found");
            }
            if (lead.status === status) {
                throw ApiError.badRequest(`Lead is already ${status}`);
            }
            const updatedLead = await leadsRepository.updateStatus(tx, tenantId, id, status);
            let deal = null;
            if (status === "QUALIFIED") {
                const defaultStage = await pipelineRepository.findDefaultStage(tx, tenantId);
                if (!defaultStage) {
                    throw ApiError.notFound("No pipeline configured for this tenant");
                }
                deal = await dealRepository.create(tx, tenantId, actingUserId, {
                    title: `${lead.company_name} opportunity`,
                    leadId: lead.id,
                    contactId: lead.contactId,
                    stageId: defaultStage.id,
                    expectedCloseDate: addDays(new Date(), 30),
                    amount: 0,
                });
            }
            return { lead: updatedLead, deal };
        });
        if (result.deal) {
            eventBus.emit("deal.created", { tenantId, dealId: result.deal.id, leadId: id });
        }
        return result;
    },
    async updateLead(tenantId, id, data) {
        const lead = await prisma.$transaction(async (tx) => {
            const lead = await leadsRepository.findById(tx, tenantId, id);
            if (!lead)
                throw ApiError.notFound('Lead not found');
            return leadsRepository.updateLead(tx, tenantId, id, data);
        });
        if (!lead)
            throw ApiError.notFound('Lead not found');
        return lead;
    },
    // async convertToContact(tenantId: string, id: string) {
    //   const lead = await prisma.$transaction(async (tx) => {
    //     const lead = await leadsRepository.findById(tx, tenantId, id);
    //     if (!lead) throw ApiError.notFound('Lead not found');
    //     return leadsRepository.findById(tx, tenantId, id);
    //   });
    //   await leadsRepository.updateStatus(tenantId, id, 'CONTRACTED');
    //   eventBus.emit('lead.converted', { leadId: id, tenantId, contactId: contact.id });
    //   return contact;
    // },
    async assign(tenantId, id, assignId) {
        const lead = await prisma.$transaction(async (tx) => {
            const existingLead = await leadsRepository.findById(tx, tenantId, id);
            if (!existingLead)
                throw ApiError.notFound("Lead Record doesn't exist!");
            let assignee = await assignRepository.viewAssignee(tx, tenantId, assignId);
            if (!assignee) {
                throw ApiError.badRequest("Assignee not found — create them first via POST /assignees");
            }
            return leadsRepository.assignLead(tx, tenantId, id, assignee.id);
        });
        return lead;
    },
};
