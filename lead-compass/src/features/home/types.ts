export interface HomeActivityItem {
  id: string;
  description: string;
  type?: string;
  created_at?: string;
  createdAt?: string;
  user?: { full_name?: string; email?: string };
}

export interface HomeLeadRecord {
  id: string;
  company_name?: string;
  project_name?: string;
  contact?: { first_name?: string; last_name?: string | null } | null;
}
