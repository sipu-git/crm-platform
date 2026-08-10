// features/assignees/types.ts

export interface Assignee {
    id: string;
    tenant_id: string;
    full_name: string;
    designation: string | null;
    department: string | null;
    userId: string | null;
    created_at: string;
    updated_at: string;
}
export interface CreateAssigneeInput {
    full_name: string;
    designation?: string;
    userId?: string;
    department?: string;
}
export interface AssignLeadInput {
    assignId: string;
    info?: CreateAssigneeInput;
}

export interface LeadAssignee {
    id: string;
    full_name: string;
    designation: string | null;
}

export interface AssigneeState {
    assignees: Assignee[];
    loading: boolean;
    error: string | null;
}