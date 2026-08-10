import { Source, LeadStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";
import { CreateLeadInput, UpdateLeadInput } from "./lead.schema.js";

export const leadsRepository = {
  create(tx: PrismaClientTx, tenantId: string, companyId: string, contactId: string, userId: string, data: CreateLeadInput) {
    return tx.leads.create({
      data: {
        tenant_id: tenantId,
        owner_name: data.owner_name,
        company_name: data.company_name.trim(),
        project_name: data.project_name.trim(),
        project_type: data.project_type?.trim(),
        companyId: companyId,
        contactId: contactId,
        source: data.source as Source,
        status: LeadStatus.NEW,
        created_by: userId,
        created_At: new Date(),
        ...(data.assigned_to ? {
          assign_to: data.assigned_to
        } : {})
      }
    })
  },
  findByName(tx: PrismaClientTx, tenantId: string, name: string) {
    return tx.company.findFirst({
      where: { tenant_id: tenantId, name },
    });
  },
  findById(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.leads.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        company: true,
        contact: true,
        assignee:true
      },
    });
  },

  findByOwner(tx: PrismaClientTx, tenantId: string, ownerId: string) {
    return tx.leads.findMany({
      where: { tenant_id: tenantId, owner_id: ownerId },
      orderBy: { created_At: "desc" },
    });
  },
  findMany(tx: PrismaClientTx, tenantId: string, filters: any) {
    return tx.leads.findMany({
      where: {
        tenant_id: tenantId,
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.assignedTo ? { status: filters.status as any } : {}),
        ...(filters.source ? { source: filters.source as any } : {}),
      },
      include: {
        company: true,
        contact: true,
        assignee:true
      },
      orderBy: { created_At: "desc" },
    });
  },
  assignOwner(tx: PrismaClientTx, tenantId: string, id: string, ownerId: string) {
    return tx.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: { owner_id: ownerId },
    });
  },

  markConverted(tx: PrismaClientTx, tenantId: string, id: string, contactId: string) {
    return tx.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        status: LeadStatus.CONTRACTED,
        converted_contact_id: contactId,
      },
    });
  },
  updateStatus(tx: PrismaClientTx, tenantId: string, id: string, status: LeadStatus) {
    return tx.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  },
  assignLead(tx: PrismaClientTx, tenantId: string, id: string, assignId: string) {
    return tx.leads.update({
      where: { id, tenant_id: tenantId },
      data: { assigned_to: assignId },
    });
  },
  updateLead(tx: PrismaClientTx, tenantId: string, id: string, data: Partial<UpdateLeadInput>) {
    return tx.leads.updateMany({
      where: { id, tenant_id: tenantId },
      data: { ...data, updated_at: new Date() },
    });
  },
};



