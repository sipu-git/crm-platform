import { APP_ROLES, type AppRole } from "@/lib/permissionContract";

const WORKSPACE_SEGMENTS: Record<AppRole, string> = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES_REP: "sales-rep",
  FINANCE: "finance",
  CLIENT: "client",
};

const SEGMENT_ROLES = new Map<string, AppRole>(
  APP_ROLES.map((role) => [WORKSPACE_SEGMENTS[role], role] as const),
);

export function getWorkspaceSegment(role: AppRole): string {
  return WORKSPACE_SEGMENTS[role];
}

export function getWorkspaceRole(segment: string | undefined): AppRole | undefined {
  return segment ? SEGMENT_ROLES.get(segment) : undefined;
}

export function getWorkspaceDashboardPath(tenantSlug: string, role: AppRole): string {
  return `/${encodeURIComponent(tenantSlug)}/workspace/${getWorkspaceSegment(role)}/dashboard`;
}
