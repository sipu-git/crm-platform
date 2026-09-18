export type Role = "ADMIN" | "MANAGER" | "SALES_REP" | "FINANCE" | "CLIENT";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export const ROLE_OPTIONS: Role[] = ["ADMIN", "MANAGER", "SALES_REP", "FINANCE", "CLIENT"];

export interface Invite {
    id: string;
    email: string;
    role: Role;
    full_name?: string | null;
    mobile?: string | null;
    phone?: string | null;
    status?: InviteStatus;
    password_hash?: string | null;
    token_hash?: string;
    tenant_id?: string;
    invited_by_id?: string;
    accepted_user_id?: string | null;
    expires_at?: string;
    createdAt?: string;
    updated_at?: string;
}

export type TeamUser = Invite;

export type InvitePayload = Partial<Invite>;

export interface InviteResult {
    id?: string;
    email?: string;
    role?: Role;
    user?: Invite;
    tempPassword?: string;
    expiresAt?: string;
}

export interface UpdateRolePayload {
    userId: string;
    role: Role;
}