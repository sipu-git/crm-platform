import { ApiError } from '../../shared/utils/ApiError';
import { eventBus } from '../../shared/event-bus';
import { leadsRepository } from './lead.repository';
import { LeadStatus } from '../../../generated/prisma/enums';
import { contactsRepository } from '../contact/contact.repository';
import { prisma } from '../../../lib/prisma';
export const leadService = {
    list(tenantId, filters) {
        return leadsRepository.findMany(tenantId, filters);
    },
    async getById(tenantId, id) {
        const lead = await leadsRepository.findById(tenantId, id);
        if (!lead)
            throw ApiError.notFound('Lead not found');
        return lead;
    },
    async create(tenantId, ownerId, input) {
        return await prisma.$transaction(async (tx) => {
            let company = await tx.company.findFirst({
                where: {
                    tenant_id: tenantId,
                    name: input.company_name.trim(),
                },
            });
            if (!company) {
                company = await tx.company.create({
                    data: {
                        tenant_id: tenantId,
                        name: input.company_name.trim(),
                    },
                });
            }
            // 3. Check duplicate lead
            const duplicateLead = await tx.leads.findFirst({
                where: {
                    tenant_id: tenantId,
                    companyId: company.id,
                    full_name: input.full_name.trim(),
                },
            });
            if (duplicateLead) {
                throw ApiError.conflict("Lead already exists for this company.");
            }
            // 4. Create lead
            const lead = await tx.leads.create({
                data: {
                    tenant_id: tenantId,
                    company_name: company.name,
                    companyId: company.id,
                    full_name: input.full_name.trim(),
                    designation: input.designation,
                    source: input.source,
                    status: LeadStatus.NEW,
                    created_At: new Date(),
                    owner_id: ownerId,
                },
            });
            return lead;
        }).then((lead) => {
            eventBus.emit("lead.created", {
                tenantId,
                leadId: lead.id,
            });
            return lead;
        });
    },
    async updateStatus(tenantId, id, status) {
        const result = await leadsRepository.updateStatus(tenantId, id, status);
        if (result.count === 0)
            throw ApiError.notFound('Lead not found');
        if (status === 'QUALIFIED') {
            eventBus.emit('lead.qualified', { leadId: id, tenantId });
        }
        else if (status === 'DISQUALIFIED') {
            eventBus.emit('lead.disqualified', { leadId: id, tenantId });
        }
    },
    async updateLead(tenantId, id, data) {
        const result = await leadsRepository.updateLead(tenantId, id, data);
        if (result.count === 0)
            throw ApiError.notFound('Lead not found');
    },
    async convertToContact(tenantId, id) {
        const lead = await leadsRepository.findById(tenantId, id);
        if (!lead)
            throw ApiError.notFound('Lead not found');
        if (lead.status !== 'QUALIFIED') {
            throw ApiError.badRequest('Only qualified leads can be converted');
        }
        const [firstName, ...rest] = lead.full_name.split(' ');
        const lastName = rest.join(' ');
        const contact = await contactsRepository.create(tenantId, lead.owner_id, {
            firstName,
            lastName,
            email: lead.email ?? '',
            phone: lead.phone ?? '',
            companyId: lead.companyId ?? '',
            // companyId:lead.,
        });
        await leadsRepository.updateStatus(tenantId, id, 'CONTRACTED');
        eventBus.emit('lead.converted', { leadId: id, tenantId, contactId: contact.id });
        return contact;
    },
    async assign(tenantId, id, ownerId) {
        const result = await leadsRepository.assignLead(tenantId, id, ownerId);
        if (result.count === 0)
            throw ApiError.notFound('Lead not found');
        return leadsRepository.findById(tenantId, id);
    },
};
