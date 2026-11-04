import {
  hasPermission as hasRolePermission,
  hasResourcePermission,
  type AppRole,
} from "@/lib/permissionContract";

export function hasPermission(role: AppRole | undefined, required: string): boolean {
  return hasRolePermission(role, required);
}

export function canAccessResource(role: AppRole | undefined, resource: string): boolean {
  return hasResourcePermission(role, resource);
}