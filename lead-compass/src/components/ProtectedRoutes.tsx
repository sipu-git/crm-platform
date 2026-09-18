import { usePermission } from "@/hooks/use-permission";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRoutesProps {
    resource: string;
    children: React.ReactNode;
}

export function ProtectedRoute({ resource, children }: ProtectedRoutesProps) {
    const { canSeeModule } = usePermission()
    const location = useLocation();

    if (!canSeeModule(resource)) {
        return <Navigate to="/403" state={{ from: location.pathname }} replace />
    }
    return <>{children}</>
}
