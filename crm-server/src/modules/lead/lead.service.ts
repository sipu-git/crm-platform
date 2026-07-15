import { leadRepository } from './lead.repository';
import { contactRepository } from '../contact/contact.repository';
import { ApiError } from '../../core/utils/ApiError';
import { eventBus } from '../../core/event-bus';
import type { CreateLeadInput, LeadFilters } from './lead.schema';

export const leadService = {
  list(tenantId: string, filters: LeadFilters) {
    return leadRepository.findMany(tenantId, filters);
  },

  async getById(tenantId: string, id: string) {
    const lead = await leadRepository.findById(tenantId, id);
    if (!lead) throw ApiError.notFound('Lead not found');
    return lead;
  },
  async create(tenantId: string, input: CreateLeadInput) {
    const existing = await leadRepository.findByEmail(tenantId, input.email);
    if (existing) {
      throw ApiError.conflict('A lead with this email already exists for this tenant');
    }

    const lead = await leadRepository.create(tenantId, input);
    eventBus.emit('lead.created', { leadId: lead.id, tenantId, assignedTo: lead.assignedTo });
    return lead;
  },

  async updateStatus(tenantId: string, id: string, status: string) {
    const result = await leadRepository.updateStatus(tenantId, id, status);
    if (result.count === 0) throw ApiError.notFound('Lead not found');

    if (status === 'QUALIFIED') {
      eventBus.emit('lead.qualified', { leadId: id, tenantId });
    } else if (status === 'DISQUALIFIED') {
      eventBus.emit('lead.disqualified', { leadId: id, tenantId });
    }

    return leadRepository.findById(tenantId, id);
  },

  async convertToContact(tenantId: string, id: string) {
    const lead = await leadRepository.findById(tenantId, id);
    if (!lead) throw ApiError.notFound('Lead not found');
    if (lead.status !== 'QUALIFIED') {
      throw ApiError.badRequest('Only qualified leads can be converted');
    }

    const contact = await contactRepository.create(tenantId, {
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? undefined,
    });

    await leadRepository.updateStatus(tenantId, id, 'CONVERTED');
    eventBus.emit('lead.converted', { leadId: id, tenantId, contactId: contact.id });

    return contact;
  },

  async assign(tenantId: string, id: string, assignedTo: string) {
    const result = await leadRepository.assign(tenantId, id, assignedTo);
    if (result.count === 0) throw ApiError.notFound('Lead not found');
    return leadRepository.findById(tenantId, id);
  },
};
