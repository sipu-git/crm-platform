// features/assignees/types.ts

export interface Assignee {
    id: string;
    tenant_id: string;
    full_name: string;
    designation: string | null;
    department: string | null;
    userId: string | null;
    email: string | null;
    created_at: string;
    updated_at: string;
    leads?: Array<{ id: string }>;
}

export interface CreateAssigneeInput {
    assignId?: string;
    full_name?: string;
    designation?: string;
    userId?: string;
    department?: string;
    email?: string;
}

export interface AssignLeadInput {
    assignId: string;
    info?: CreateAssigneeInput;
}

export interface LeadAssignee {
    id: string;
    full_name: string;
    designation: string | null;
    email: string | null;
    department: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
