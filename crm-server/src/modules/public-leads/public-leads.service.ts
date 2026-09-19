import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { companyContactResolver } from '../projects/utils/resolver.util.js';
import type { PublicLeadInput } from './public-leads.schema.js';

export const publicLeadService = {
    async submit(input: PublicLeadInput) {
      return prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.findUnique({ where: { id: input.tenantId } });
        if (!tenant) throw ApiError.notFound('Tenant not found');
        const creator = await tx.user.findFirst({ where: { tenantId: tenant.id, role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, orderBy: { createdAt: 'asc' } });
        if (!creator) throw ApiError.badRequest('Tenant is not ready to receive public leads');

        const company = await companyContactResolver.resolveCompany(tx, tenant.id, creator.id, undefined, input.company_name, 'WEBSITE');
        const contact = await companyContactResolver.resolveContact(tx, tenant.id, creator.id, company.id, undefined, {
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email.toLowerCase(),
          phone: input.phone,
          designation: input.designation,
        });
        // Leads deliberately are not deduplicated: each submission is a business event.
        const lead = await tx.leads.create({
          data: {
            tenant_id: tenant.id,
            company_name: company.name,
            companyId: company.id,
            contactId: contact.id,
            project_name: input.project_name,
            project_type: input.project_type,
            source: 'WEBSITE',
            created_by: creator.id,
          },
        });
        // Also create a project for the public lead
        const { projectService } = await import('../projects/project.service.js');
        await projectService.createProject({
          tenantId: tenant.id,
          companyId: company.id,
          creatorId: creator.id,
          leadId: lead.id,
          contactId: contact.id,
          data: {
            company_name: input.company_name,
            project_name: input.project_name ?? null,
            source: 'WEBSITE',
            project_type: (input.project_type as any) ?? null,
          },
        });
        return lead;
      });
    },
};
