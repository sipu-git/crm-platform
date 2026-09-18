import { Company } from "@/features/companies/types/companies.types";
import { Contact } from "@/features/contacts/contact.types";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";
import { Lead } from "@/features/leads/types/lead.types";

export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export type Source = "WEBSITE" | "REFERAL" | "SOCIAL_MEDIA" | "EVENT" | "WEBINAR" | "OTHER";

export interface Project {
    id: string;
    tenant_id: string;
    companyId: string;
    contactId: string | null;
    owner_id: string | null;
    originating_lead_id: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    status: ProjectStatus;
    enquiry?: Enquiry | null;
    company?: Company | null;
    contacts?: Contact | null;
    originatingLead?: Lead | null;
}

export interface CreateProjectPayload {
    companyId?: string;
    contactId?: string;
    company_name: string;
    source: Source;
    first_name?: string;
    last_name?: string;
    contact_email?: string;
    contact_phone?: string;
    designation?: string;
    project_name: string;
    project_type?: string;
    status?: ProjectStatus; // defaults to NOT_STARTED server-side
    start_date?: string;
    due_date?: string;
    budget?: number;
    owner_id?: string;
}

export interface ConvertLeadToProjectPayload {
    lead_id: string;
    owner_id?: string;
    start_date?: string;
    due_date?: string;
    budget?: number;
}

export interface UpdateProjectPayload {
    project_name?: string;
    project_type?: string;
    status?: ProjectStatus;
    start_date?: string;
    due_date?: string;
    budget?: number;
    owner_id?: string;
}

export interface ListProjectsParams {
    status?: ProjectStatus;
    companyId?: string;
    owner_id?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface ApiSuccess<T> {
    success: true;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
    };
}

export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ProjectState {
    items: Project[];
    listStatus: AsyncStatus;
    listError: string | null;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
    };
    filters: ListProjectsParams;
    selected: Project | null;
    selectedStatus: AsyncStatus;
    selectedError: string | null;
    createStatus: AsyncStatus;
    createError: string | null;
    convertStatus: AsyncStatus;
    convertError: string | null;
    updateStatus: AsyncStatus;
    updateError: string | null;
}