import { Source, LeadStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import { CreateLeadInput, UpdateLeadInput } from "./lead.schema.js";

export const leadsRepository = {
  create(tenantId: string, ownerId: string,companyId: string, data: CreateLeadInput) {
  return prisma.leads.create({
    data: {
      tenant_id: tenantId,
      company_name: data.company_name,
      companyId: companyId,
      full_name: data.full_name,
      source: data.source,
      designation: data.designation,
      status: LeadStatus.NEW,
      owner_id: ownerId,
      created_At: new Date(),
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
},
updateLead(tenantId: string, id: string, data: Partial<UpdateLeadInput>) {
  return prisma.leads.updateMany({
    where: { id, tenant_id: tenantId },
    data: { ...data, updated_at: new Date() },
  });
},
};



