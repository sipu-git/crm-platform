export interface LeadSearchFilters {
  query?: string;
  company_name?: string;
  project_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface DealSearchFilters {
  query?: string;
  title?: string;
  company_name?: string;
}

export interface InvoiceSearchFilters {
  query?: string;
  invoice_number?: string;
  buyer_name?: string;
  gstnumber?: string;
}

export interface GlobalSearchFilters {
  q?: string;
  limit?: number;
  types?: ('lead' | 'deal' | 'invoice')[];
  // Lead-specific filters
  company_name?: string;
  project_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  // Deal-specific filters
  title?: string;
  // Invoice-specific filters
  invoice_number?: string;
  buyer_name?: string;
  gstnumber?: string;
}
