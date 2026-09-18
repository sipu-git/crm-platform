import { Deal } from "../deals/deal.types";
import { Invoice } from "../invoices/types/invoices.type";
import { Lead } from "../leads/types/lead.types";

export type SearchType = "lead" | "deal" | "invoice";

export interface SearchItemNavigation {
    id: string;
    type: SearchType;
    title: string;
    subtitle: string;
    badge?: string;
    url: string;
}

export interface SearchFilters {
    company_name?: string;
    project_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    title?: string;
    invoice_number?: string;
    buyer_name?: string;
    gstnumber?: string;
}

export interface SearchParams extends SearchFilters {
    query?: string;
    types?: SearchType[];
    limit?: number;
    signal?: AbortSignal;
}

export interface SearchResult {
    leads: Lead[];
    deals: Deal[];
    invoices: Invoice[];
    navigation?: SearchItemNavigation[];
    totalCount?: number;
}