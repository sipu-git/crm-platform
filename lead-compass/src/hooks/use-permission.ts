// src/hooks/usePermission.ts
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { hasPermission } from "@/features/auth/permission";
import { useAppSelector } from "@/store/hooks";

export function usePermission() {
  const auth = useAuthPayload()
  const permissions = auth?.permissions;


  const can = (required: string): boolean => hasPermission(permissions, required);

  // Loose check for nav/route visibility — "does this role touch this module at all"
  const canSeeModule = (resource: string): boolean =>
    permissions.includes("*") ||
    permissions.some((p) => p.split(":")[0] === resource);

  return { can, canSeeModule, permissions };
}