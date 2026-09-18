import { PrismaClientTx } from "../../shared/utils/prisma.types";
import { DealSearchFilters, InvoiceSearchFilters, LeadSearchFilters } from "./apis.types";


export const apisRepository = {
  searchLeads(tx: PrismaClientTx, tenantId: string, filters: LeadSearchFilters, limit: number) {
    const conditions: any[] = [];

    if (filters.query?.trim()) {
      const q = filters.query.trim();
      conditions.push({
        OR: [
          { company_name: { contains: q, mode: 'insensitive' } },
          { project_name: { contains: q, mode: 'insensitive' } },
          { contact: { first_name: { contains: q, mode: 'insensitive' } } },
          { contact: { last_name: { contains: q, mode: 'insensitive' } } },
          { contact: { email: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (filters.company_name?.trim()) {
      conditions.push({ company_name: { contains: filters.company_name.trim(), mode: 'insensitive' } });
    }
    if (filters.project_name?.trim()) {
      conditions.push({ project_name: { contains: filters.project_name.trim(), mode: 'insensitive' } });
    }
    if (filters.first_name?.trim()) {
      conditions.push({ contact: { first_name: { contains: filters.first_name.trim(), mode: 'insensitive' } } });
    }
    if (filters.last_name?.trim()) {
      conditions.push({ contact: { last_name: { contains: filters.last_name.trim(), mode: 'insensitive' } } });
    }
    if (filters.email?.trim()) {
      conditions.push({ contact: { email: { contains: filters.email.trim(), mode: 'insensitive' } } });
    }

    return tx.leads.findMany({
      where: {
        tenant_id: tenantId,
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      },
      include: {
        contact: true,
        company: true,
        assignee: true,
      },
      orderBy: { created_At: 'desc' },
      take: limit,
    });
  },

  searchDeals(tx: PrismaClientTx, tenantId: string, filters: DealSearchFilters, limit: number) {
    const conditions: any[] = [];

    if (filters.query?.trim()) {
      const q = filters.query.trim();
      conditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { leads: { company_name: { contains: q, mode: 'insensitive' } } },
          { leads: { project_name: { contains: q, mode: 'insensitive' } } },
          { contact: { first_name: { contains: q, mode: 'insensitive' } } },
          { contact: { last_name: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (filters.title?.trim()) {
      conditions.push({ title: { contains: filters.title.trim(), mode: 'insensitive' } });
    }
    if (filters.company_name?.trim()) {
      conditions.push({
        leads: { company_name: { contains: filters.company_name.trim(), mode: 'insensitive' } },
      });
    }

    return tx.deal.findMany({
      where: {
        tenant_id: tenantId,
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      },
      include: {
        pipeline: true,
        contact: true,
        leads: true,
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  },

  searchInvoices(tx: PrismaClientTx, tenantId: string, filters: InvoiceSearchFilters, limit: number) {
    const conditions: any[] = [];

    if (filters.query?.trim()) {
      const q = filters.query.trim();
      conditions.push({
        OR: [
          { invoice_number: { contains: q, mode: 'insensitive' } },
          { buyer_name: { contains: q, mode: 'insensitive' } },
          { buyer_gstin: { contains: q, mode: 'insensitive' } },
          { seller_gstin: { contains: q, mode: 'insensitive' } },
          { company: { name: { contains: q, mode: 'insensitive' } } },
          { company: { gst_number: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (filters.invoice_number?.trim()) {
      conditions.push({ invoice_number: { contains: filters.invoice_number.trim(), mode: 'insensitive' } });
    }
    if (filters.buyer_name?.trim()) {
      conditions.push({ buyer_name: { contains: filters.buyer_name.trim(), mode: 'insensitive' } });
    }
    if (filters.gstnumber?.trim()) {
      const gst = filters.gstnumber.trim();
      conditions.push({
        OR: [
          { buyer_gstin: { contains: gst, mode: 'insensitive' } },
          { seller_gstin: { contains: gst, mode: 'insensitive' } },
          { company: { gst_number: { contains: gst, mode: 'insensitive' } } },
        ],
      });
    }

    return tx.invoice.findMany({
      where: {
        tenant_id: tenantId,
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      },
      include: {
        contact: true,
        deal: true,
        company: true,
        project: true,
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  },
};