import { Lead } from "../leads/lead.types";
import { CompanySize, CompanyStatus } from "./company.validate";

export interface Company {
  id: string;
  tenant_id: string;
  name: string;
  legal_name?: string | null;
  industry?: string | null;
  size?: CompanySize | null;
  leads?: Lead[] | null;
  annual_revenue?: number | null;
  company_status: CompanyStatus;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  source?: string | null;
  tags?: string[];
  custom_fields?: Record<string, unknown> | null;
  created_at?: string;
  _count?: { leads: number };
}

// Mirrors createCompanySchema (zod) — required fields match schema, optional fields dropped rather than nullable
export interface CreateCompany {
  name: string;
  legal_name?: string;
  industry?: string;
  size?: CompanySize;
  annual_revenue?: number;
  company_status?: CompanyStatus;
  website?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  owner_name: string;
}

export type UpdateCompany = Partial<CreateCompany>;

// Mirrors filterCompanySchema
export interface FilterCompanyQuery {
  company?: string;
  industry?: string;
  size?: CompanySize;
  company_status?: CompanyStatus;
  owner_id?: string;
  page?: number;
  limit?: number;
}

export interface CompanyState {
  companies: Company[];
  companyDetail: Company | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}