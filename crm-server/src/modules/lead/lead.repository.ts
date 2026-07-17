import { Source, LeadStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { CreateLeadInput } from "./lead.schema";

export const leadsRepository = {
  create(tenantId: string, ownerId: string, data: CreateLeadInput) {
  return prisma.leads.create({
    data: {
      tenant_id: tenantId,
      companyId: data.companyId,
      full_name: data.full_name,
      email: data.email,
      source: data.source,
      phone: data.phone,
      status: LeadStatus.NEW,
      owner_id: ownerId,
    },
  });
},
findByName(tenantId: string, name: string) {
  return prisma.company.findFirst({
    where: { tenant_id: tenantId, name },
  });
},
  findById(tenantId: string, id: string) {
    return prisma.leads.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  findByOwner(tenantId: string, ownerId: string) {
    return prisma.leads.findMany({
      where: { tenant_id: tenantId, owner_id: ownerId },
      orderBy: { created_At: "desc" },
    });
  },
  findMany(tenantId: string, filters: any) {
    return prisma.leads.findMany({
      where: {
        tenant_id: tenantId,
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.assignedTo ? { status: filters.status as any } : {}),
        ...(filters.source ? { source: filters.source as any } : {}),
      },
      orderBy: { created_At: "desc" },
    });
  },
  assignOwner(tenantId: string, id: string, ownerId: string) {
    return prisma.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: { owner_id: ownerId },
    });
  },

  markConverted(tenantId: string, id: string, contactId: string) {
    return prisma.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        status: LeadStatus.CONTRACTED,
        converted_contact_id: contactId,
      },
    });
  },
  updateStatus(tenantId: string, id: string, status: LeadStatus) {
  return prisma.leads.updateMany({
    where: { id, tenant_id: tenantId },
    data: {
      status,
      updated_at: new Date(),
    },
  });
},
assignLead(tenantId: string, id: string, ownerId: string) {
  return prisma.leads.updateMany({
    where: { id, tenant_id: tenantId },
    data: { owner_id: ownerId },
  });
}
};

