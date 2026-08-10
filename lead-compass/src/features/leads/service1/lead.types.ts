import { Company } from "@/features/companies/company.types";
import { Contact } from "@/features/contacts/contact.types";
import { Assignee } from "../service2/assign.types";


export const LEAD_SOURCES = [
  "WEBSITE",
  "REFERAL",
  "EVENT",
  "SOCIAL_MEDIA",
  "WEBINAR",
  "OTHER",
] as const;
export type Source = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ["NEW", "CONTRACTED", "QUALIFIED", "DISQUALIFIED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_ICONS: Record<LeadStatus, string> = {
  NEW: "🆕",
  CONTRACTED: "📞",
  QUALIFIED: "✅",
  DISQUALIFIED: "🚫",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "#3b82f6",
  CONTRACTED: "#f59e0b",
  QUALIFIED: "#22c55e",
  DISQUALIFIED: "#ef4444",
};

export interface Lead {
  id: string;
  tenant_id: string;
  company_name: string;
  companyId?: string;
  project_name: string;
  project_type?: string;
  contactId?: string;
  owner_name: string;
  source: Source;
  status: LeadStatus;
  company?: Company | null;
  contact?: Contact | null;
  created_by: string;
  email: string;
  phone: string;
  created_At?: string;
  updated_at?: string;
  assignee?: Assignee;
}

// Mirrors backend createLeadSchema exactly — what the create form submits
export interface CreateLeadInput {
  first_name: string;
  last_name: string;
  project_name: string;
  project_type?: string;
  designation: string;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  source: Source;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;

export interface LeadFilters {
  status?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadState {
  leads: Lead[];
  leadDetail: Lead | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}