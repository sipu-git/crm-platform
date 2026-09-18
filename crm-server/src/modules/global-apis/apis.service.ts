import { prisma } from "../../../lib/prisma";
import { apisRepository } from "./apis.repository";
import { GlobalSearchFilters } from "./apis.types";

const VALID_TYPES = ['lead', 'deal', 'invoice'] as const;
export type SearchType = typeof VALID_TYPES[number];

export interface SearchItemNavigation {
  id: string;
  type: 'lead' | 'deal' | 'invoice';
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

export const apiService = {
  async search(tenantId: string, filters: GlobalSearchFilters) {
    const types = (filters.types && filters.types.length) ? filters.types : (VALID_TYPES as unknown as ('lead' | 'deal' | 'invoice')[]);
    const limit = filters.limit || 5;
    const query = filters.q || '';

    const leadFilters = {
      query,
      company_name: filters.company_name,
      project_name: filters.project_name,
      first_name: filters.first_name,
      last_name: filters.last_name,
      email: filters.email,
    };

    const dealFilters = {
      query,
      title: filters.title,
      company_name: filters.company_name,
    };

    const invoiceFilters = {
      query,
      invoice_number: filters.invoice_number,
      buyer_name: filters.buyer_name,
      gstnumber: filters.gstnumber,
    };

    const searchResults = await prisma.$transaction(async (tx) => {
      const [leads, deals, invoices] = await Promise.all([
        types.includes('lead') ? apisRepository.searchLeads(tx, tenantId, leadFilters, limit) : [],
        types.includes('deal') ? apisRepository.searchDeals(tx, tenantId, dealFilters, limit) : [],
        types.includes('invoice') ? apisRepository.searchInvoices(tx, tenantId, invoiceFilters, limit) : [],
      ]);

      const navigation: SearchItemNavigation[] = [
        ...leads.map((l: any): SearchItemNavigation => ({
          id: l.id,
          type: 'lead',
          title: l.company_name || l.project_name || 'Untitled Lead',
          subtitle: `${l.contact?.first_name || ''} ${l.contact?.last_name || ''}`.trim() || l.contact?.email || l.project_name || '',
          badge: l.status,
          url: `/lead/${l.id}`,
        })),
        ...deals.map((d: any): SearchItemNavigation => ({
          id: d.id,
          type: 'deal',
          title: d.title,
          subtitle: d.leads?.company_name ? `${d.leads.company_name} · ₹${d.amount}` : `₹${d.amount}`,
          badge: d.pipeline?.name || 'Deal',
          url: `/deals/${d.id}`,
        })),
        ...invoices.map((i: any): SearchItemNavigation => ({
          id: i.id,
          type: 'invoice',
          title: i.invoice_number,
          subtitle: `${i.buyer_name} · ₹${i.total_amount}`,
          badge: i.status,
          url: `/invoices/${i.id}`,
        })),
      ];

      return {
        leads,
        deals,
        invoices,
        navigation,
        totalCount: leads.length + deals.length + invoices.length,
      };
    });

    return searchResults;
  },
};