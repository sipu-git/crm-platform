import type { CreateLeadInput, LeadFilters, UpdateLeadInput } from './lead.schema.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { eventBus } from '../../shared/event-bus/index.js';
import { leadsRepository } from './lead.repository.js';
import { LeadStatus } from '../../../generated/prisma/enums.js';
import { contactsRepository } from '../contact/contact.repository.js';
import { prisma } from '../../../lib/prisma.js';
import { companyRepository } from '../company/company.repository.js';
import { dealRepository } from '../deal/deal.repository.js';
import { pipelineRepository } from '../deal/pipeline.repository.js';
import { addDays } from 'date-fns';
import { assignRepository } from './lead-assignment/assign.repository.js';
import { CreateAssignInputs } from './lead-assignment/assign.schema.js';
import { LeadStatusOrder } from './lead.util.js';

export const leadService = {
  async list(tenantId: string, filters: LeadFilters) {
    const leads = await prisma.$transaction(async (tx) => {
      return leadsRepository.findMany(tx, tenantId, filters);
    });
    if (!leads || leads.length === 0) throw ApiError.notFound('No leads found');
    return leads;
  },

  async getById(tenantId: string, id: string) {
    const lead = await prisma.$transaction(async (tx) => {
      return leadsRepository.findById(tx, tenantId, id);
    })
    if (!lead) throw ApiError.notFound('Lead not found');
    return lead;
  },
  async create(tenantId: string, userId: string, input: CreateLeadInput) {
    const lead = await prisma.$transaction(async (tx) => {
      const company = await companyRepository.upsertStubByName(
        tx, tenantId, userId, input.company_name.trim(), input.source
      );

      let contact = input.email ? await tx.contacts.findFirst({
        where: { tenant_id: tenantId, companyId: company.id, email: input.email },
      })
        : input.phone
          ? await tx.contacts.findFirst({
            where: { tenant_id: tenantId, companyId: company.id, phone: input.phone },
          }) : null;

      if (!contact) {
        contact = await contactsRepository.create(tx, tenantId, userId, {
          companyId: company.id,
          firstName: input.first_name.trim(),
          lastName: input.last_name?.trim(),
          designation: input.designation,
          email: input.email,
          phone: input.phone,
        });
      }

      return leadsRepository.create(tx, tenantId, company.id, contact.id, userId, input);
    });

    eventBus.emit("lead.created", { leadId: lead.id, tenantId });
    return lead;
  },
  
  async updateStatus(tenantId: string, id: string, status: LeadStatus, actingUserId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const lead = await leadsRepository.findById(tx, tenantId, id);

      if (!lead) {
        throw ApiError.notFound("Lead not found");
      }

      if (lead.status === status) {
        throw ApiError.badRequest(`Lead is already ${status}`);
      }

      const currentIndex = LeadStatusOrder.indexOf(lead.status)
      const targetIndex = LeadStatusOrder.indexOf(status)
      if (currentIndex === -1 || targetIndex === -1) {
        throw ApiError.badRequest(`Unrecognized lead status transition: ${lead.status} → ${status}`);
      }

      if (targetIndex < currentIndex) {
        throw ApiError.badRequest(`Cannot move lead backward from "${lead.status}" to "${status}"`);
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
    eventBus.emit("lead.status_changed", {
      leadId: id,
      tenantId,
      status,
    });
    if (result.deal) {
      eventBus.emit("deal.created", { tenantId, dealId: result.deal.id, leadId: id });
    }

    return result;
  },
  async updateLead(tenantId: string, id: string, data: any) {
    const lead = await prisma.$transaction(async (tx) => {
      const lead = await leadsRepository.findById(tx, tenantId, id);
      if (!lead) throw ApiError.notFound('Lead not found');
      return leadsRepository.updateLead(tx, tenantId, id, data);
    });
    if (!lead) throw ApiError.notFound('Lead not found');
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
  async assign(tenantId: string, id: string, assignId: string) {
    const lead = await prisma.$transaction(async (tx) => {
      const existingLead = await leadsRepository.findById(tx, tenantId, id);
      if (!existingLead) throw ApiError.notFound("Lead Record doesn't exist!");

      let assignee = await assignRepository.viewAssignee(tx, tenantId, assignId);
      if (!assignee) {
        throw ApiError.badRequest("Assignee not found — create them first via POST /assignees");
      }
      return leadsRepository.assignLead(tx, tenantId, id, assignee.id);
    });

    eventBus.emit("lead.assigned", { leadId: id, tenantId, assignedTo: assignId });

    return lead;
  },
  async delete(tenantId: string, id: string) {
    const lead = await prisma.$transaction(async (tx) => {
      return leadsRepository.deleteLead(tx, tenantId, id);
    })
    eventBus.emit("lead.deleted", { leadId: id, tenantId });
    return lead;
  }
};
