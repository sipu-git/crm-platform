// components/shared/RoleLabel.tsx
import { Badge } from "@/components/ui/badge";
import { Role } from "@/features/auth/types/auth.types";

const ROLE_COLORS: Record<Role, string> = {
    SUPER_ADMIN: "#BE123C",
    ADMIN: "#7C3AED",
    MANAGER: "#2563EB",
    SALES_REP: "#059669",
    FINANCE: "#D97706",
    CLIENT: "#64748B",
};

function isKnownRole(role: string): role is Role {
    return role in ROLE_COLORS;
}

interface RoleLabelProps {
    role?: string;
    variant?: "badge" | "text";
    className?: string;
}

export function RoleLabel({ role, variant = "badge", className }: RoleLabelProps) {
    const safeRole = role ?? "unknown";
    const lower = safeRole.toLowerCase();
    const color = isKnownRole(safeRole) ? ROLE_COLORS[safeRole] : "hsl(var(--muted-foreground))";

    if (variant === "text") {
        return (
            <span className={`text-xs font-medium text-muted-foreground ${className ?? ""}`}>
                {lower}
            </span>
        );
    }

    return (
        <Badge
            variant="secondary"
            className={`h-5 rounded-full px-2 text-[10px] font-medium ${className ?? ""}`}
            style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
            data-testid={`role-label-${lower}`}
        >
            {lower}
        </Badge>
    );
}
