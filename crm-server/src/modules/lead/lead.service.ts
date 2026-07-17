import type { CreateLeadInput, LeadFilters } from './lead.schema';
import { ApiError } from '../../shared/utils/ApiError';
import { eventBus } from '../../shared/event-bus';
import { leadsRepository } from './lead.repository';
import { LeadStatus } from '../../../generated/prisma/enums';
import { contactsRepository } from '../contact/contact.repository';

export const leadService = {
  list(tenantId: string, filters: LeadFilters) {
    return leadsRepository.findMany(tenantId, filters);
  },

  async getById(tenantId: string, id: string) {
    const lead = await leadsRepository.findById(tenantId, id);
    if (!lead) throw ApiError.notFound('Lead not found');
    return lead;
  },
  async create(tenantId: string, ownerId: string, input: CreateLeadInput) {
    const existing = await leadsRepository.findById(tenantId, input.email);
    if (existing) {
      throw ApiError.conflict('A lead with this email already exists for this tenant');
    }
    const company = await leadsRepository.findByName(tenantId, input.company_name);
    if (!company) {
      throw ApiError.conflict('A company with this name does not exist for this tenant');
    }
    const lead = await leadsRepository.create(tenantId, ownerId, {
      ...input,
      companyId: company.id
    });
    eventBus.emit('lead.created', { leadId: lead.id, tenantId });
    return lead;
  },
  async updateStatus(tenantId: string, id: string, status: LeadStatus) {
    const result = await leadsRepository.updateStatus(tenantId, id, status);
    if (result.count === 0) throw ApiError.notFound('Lead not found');

    if (status === 'QUALIFIED') {
      eventBus.emit('lead.qualified', { leadId: id, tenantId });
    } else if (status === 'DISQUALIFIED') {
      eventBus.emit('lead.disqualified', { leadId: id, tenantId });
    }
  },

  async convertToContact(tenantId: string, id: string) {
    const lead = await leadsRepository.findById(tenantId, id);
    if (!lead) throw ApiError.notFound('Lead not found');
    if (lead.status !== 'QUALIFIED') {
      throw ApiError.badRequest('Only qualified leads can be converted');
    }

    const [firstName, ...rest] = lead.full_name.split(' ');
    const lastName = rest.join(' ');

    const contact = await contactsRepository.create(tenantId, lead.owner_id, {
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone ?? undefined,
      companyId: lead.companyId,
      // companyId:lead.,
    });

    await leadsRepository.updateStatus(tenantId, id, 'CONTRACTED');
    eventBus.emit('lead.converted', { leadId: id, tenantId, contactId: contact.id });

    return contact;
  },
  async assign(tenantId: string, id: string, ownerId: string) {
    const result = await leadsRepository.assignLead(tenantId, id, ownerId);
    if (result.count === 0) throw ApiError.notFound('Lead not found');
    return leadsRepository.findById(tenantId, id);
  },
};
