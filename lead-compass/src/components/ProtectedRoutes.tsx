import { usePermission } from "@/features/auth/hooks/use-permission";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { Navigate, useLocation } from "react-router-dom";
import type { AppRole } from "@/lib/permissionContract";

interface ProtectedRoutesProps {
  resource?: string;
  roles?: readonly AppRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ resource, roles, children }: ProtectedRoutesProps) {
  const { canSeeModule } = usePermission();
  const role = useAuthPayload()?.user?.role;
  const location = useLocation();
  const hasAccess =
    (resource !== undefined && canSeeModule(resource)) ||
    (role !== undefined && roles !== undefined && roles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/403" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
