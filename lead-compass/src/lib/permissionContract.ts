export const APP_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "SALES_REP",
  "FINANCE",
  "CLIENT",
] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type Permission = string;

const RESOURCES = [
  "activities",
  "audit",
  "communications",
  "company",
  "contacts",
  "deals",
  "enquires",
  "invoices",
  "leads",
  "notifications",
  "projects",
  "users",
  "settings",
] as const;

export const REGISTERED_PERMISSIONS = RESOURCES.map(
  (resource) => `${resource}:read`,
) as readonly Permission[];

const ADMIN_PERMISSIONS = REGISTERED_PERMISSIONS;

export const ROLE_PERMISSIONS: Readonly<Record<AppRole, readonly Permission[]>> = {
  SUPER_ADMIN: ADMIN_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  MANAGER: [
    "activities:read",
    "audit:read",
    "communications:read",
    "company:read",
    "contacts:read",
    "deals:read",
    "enquires:read",
    "invoices:read",
    "leads:read",
    "notifications:read",
    "projects:read",
    "users:read",
  ],
  SALES_REP: [
    "activities:read",
    "communications:read",
    "company:read",
    "contacts:read",
    "deals:read",
    "enquires:read",
    "invoices:read",
    "leads:read",
    "notifications:read",
    "projects:read",
  ],
  FINANCE: ["company:read", "contacts:read", "deals:read", "invoices:read", "notifications:read"],
  CLIENT: ["company:read", "invoices:read", "notifications:read", "projects:read"],
};

export function getRolePermissions(role: AppRole | undefined): readonly Permission[] {
  return role ? ROLE_PERMISSIONS[role] : [];
}

export function hasPermission(role: AppRole | undefined, required: string): boolean {
  return getRolePermissions(role).includes(required);
}

export function hasResourcePermission(role: AppRole | undefined, resource: string): boolean {
  return hasPermission(role, `${resource}:read`);
}

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.some((role) => role === value);
}

export function isRegisteredPermission(value: unknown): value is Permission {
  return typeof value === "string" && REGISTERED_PERMISSIONS.includes(value);
}
