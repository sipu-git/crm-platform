import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { canAccessResource, hasPermission } from "@/features/auth/utils/permission";
import { getRolePermissions } from "@/lib/permissionContract";

export function usePermission() {
  const auth = useAuthPayload();
  const role = auth?.user?.role;
  const permissions = getRolePermissions(role);

  const can = (required: string): boolean => hasPermission(role, required);
  const canSeeModule = (resource: string): boolean => canAccessResource(role, resource);

  return { can, canSeeModule, permissions };
}
