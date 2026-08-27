// src/hooks/usePermission.ts
import { hasPermission } from "@/features/auth/permission";
import { useAppSelector } from "@/store/hooks";

export function usePermission() {
  const permissions = useAppSelector((s) => s.auth.permissions) ?? [];

  const can = (required: string): boolean => hasPermission(permissions, required);

  // Loose check for nav/route visibility — "does this role touch this module at all"
  const canSeeModule = (resource: string): boolean =>
    permissions.includes("*") ||
    permissions.some((p) => p.split(":")[0] === resource);

  return { can, canSeeModule, permissions };
}