import { LeadStatus, Source } from "../../../../generated/prisma/enums";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { CreateLeadInput, UpdateLeadInput } from "../validations/lead.schema";
import type { AccessTokenPayload } from "../../../shared/utils/jwt";

function accessScope(user?: AccessTokenPayload) {
  if (!user || user.role === "ADMIN" || user.role === "MANAGER") return {};
  if (user.role === "CLIENT") return user.companyId ? { companyId: user.companyId } : { id: "__no_company_access__" };
  if (user.role === "SALES_REP") return { assignee: { userId: user.userId } };
  return {};
}

export const leadsRepository = {
  create(tx: PrismaClientTx, tenantId: string, companyId: string, contactId: string, userId: string, data: CreateLeadInput) {
    return tx.leads.create({
      data: {
        tenant_id: tenantId,
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
  findById(tx: PrismaClientTx, tenantId: string, id: string, user?: AccessTokenPayload) {
    return tx.leads.findFirst({
      where: { id, tenant_id: tenantId, ...accessScope(user) },
      include: {
        company: true,
        contact: true,
        assignee: true
      },
    });
  },

  findByOwner(tx: PrismaClientTx, tenantId: string, ownerId: string) {
    return tx.leads.findMany({
      where: { tenant_id: tenantId, owner_id: ownerId },
      orderBy: { created_At: "desc" },
    });
  },
  findMany(tx: PrismaClientTx, tenantId: string, filters: any, user?: AccessTokenPayload) {
    return tx.leads.findMany({
      where: {
        tenant_id: tenantId,
        ...accessScope(user),
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.assignedTo ? { assigned_to: filters.assignedTo } : {}),
        ...(filters.source ? { source: filters.source as any } : {}),
      },
      include: {
        company: true,
        contact: true,
        assignee: true
      },
      orderBy: { created_At: "desc" },
    });
  },

  search(tx: PrismaClientTx, tenantId: string, query: string, limit: number, user?: AccessTokenPayload) {
    return tx.leads.findMany({
      where: {
        tenant_id: tenantId,
        ...accessScope(user),
        OR: [
          { company_name: { contains: query, mode: "insensitive" } },
          { project_name: { contains: query, mode: "insensitive" } },
          { contact: { is: { OR: [{ first_name: { contains: query, mode: "insensitive" } }, { last_name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } } },
        ],
      },
      include: { company: true, contact: true, assignee: true },
      take: limit,
      orderBy: { created_At: "desc" },
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

  async findByEnquiry(tx: PrismaClientTx, tenantId: string, enquiry: { company_name?: string | null; project_name?: string | null }) {
    const predicates: Array<Record<string, any>> = [];

    if (enquiry.company_name) {
      predicates.push({ company_name: enquiry.company_name });
    }

    if (enquiry.project_name) {
      predicates.push({ project_name: enquiry.project_name });
    }

    return tx.leads.findFirst({
      where: {
        tenant_id: tenantId,
        ...(predicates.length ? { OR: predicates } : {}),
      },
      select: { id: true, companyId: true, contactId: true },
      orderBy: { created_At: 'desc' },
    });
  },

  async deleteLead(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.leads.delete({
      where: { id, tenant_id: tenantId },
    });
  },

};



