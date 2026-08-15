// src/features/contacts/contacts.types.ts

import { Lead } from "../leads/service1/lead.types";

export interface Contact {
    id: string;
    tenant_id: string;
    companyId: string;
    first_name: string;
    last_name?: string | null;
    designation?: string | null;
    email?: string | null;
    phone?: string | null;
    created_by: string;
    created_at?: string;
    updated_at?: string;
    lead?: Lead | null;
    _count?: { lead: number };

}

// Fields a user actually supplies when a contact is created —
// tenant_id / created_by are injected server-side from auth context,
// not sent by the client.
export interface CreateContactInput {
    companyId: string;
    first_name: string;
    last_name?: string;
    designation?: string;
    email?: string;
    phone?: string;
}

export type UpdateContact = Partial<Omit<CreateContactInput, "companyId">>;

export interface FilterContactQuery {
    companyId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ContactState {
    contacts: Contact[];
    contactDetail: Contact | null;
    loading: boolean;
    error: string | null;
    success: boolean;
}