export type Role = "ADMIN" | "MANAGER" | "SALES_REP" | "FINANCE" | "CLIENT";

export const ROLE_OPTIONS: Role[] = ["ADMIN", "MANAGER", "SALES_REP", "FINANCE", "CLIENT"];

export interface TeamUser {
    id: string;
    full_name: string;
    email: string;
    role: Role;
    mobile: string;
    createdAt: string;
}

export interface InvitePayload {
    full_name: string;
    email: string;
    mobile: string;
    role: Role;
}

export interface InviteResult {
    user: TeamUser;
    tempPassword: string;
}

export interface UpdateRolePayload {
    userId: string;
    role: Role;
}

export interface UsersState {
    items: TeamUser[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    inviteStatus: "idle" | "loading" | "succeeded" | "failed";
    inviteError: string | null;
    updateRoleStatus: "idle" | "loading" | "succeeded" | "failed";
    updateRoleError: string | null;
    removeStatus: "idle" | "loading" | "succeeded" | "failed";
    removeError: string | null;
    lastInviteResult: InviteResult | null;
}