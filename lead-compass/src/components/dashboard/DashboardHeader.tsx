import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Users,
  Briefcase,
  CreditCard,
  RefreshCw,
  Calendar,
} from "lucide-react";
import type { DashboardRole } from "@/features/dashboard/types/dashboard.types";
import { ROLE_LABELS } from "@/features/dashboard/configs/dashboard.config";
import { format } from "date-fns";

const ROLE_ICONS: Record<DashboardRole, React.ReactNode> = {
  ADMIN: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  MANAGER: <Users className="h-4 w-4 text-purple-500" />,
  SALES_REP: <Briefcase className="h-4 w-4 text-blue-500" />,
  FINANCE: <CreditCard className="h-4 w-4 text-amber-500" />,
};

export function DashboardHeader({
  activeRole,
  userName = "Team Member",
  onRefresh,
  isLoading,
}: {
  activeRole: DashboardRole;
  userName?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}) {
  const currentMeta = ROLE_LABELS[activeRole] || ROLE_LABELS.ADMIN;

  return (
    <div className="flex flex-col gap-4 border-b border-border/70 bg-card/60 backdrop-blur-md px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Title & Greeting */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Welcome back, {userName.split(" ")[0]}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {ROLE_ICONS[activeRole]}
            <span>{currentMeta.badge}</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{currentMeta.description}</p>
      </div>

      {/* Date & Refresh */}
      <div className="flex items-center gap-2.5">
        {/* Date period badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(), "MMMM yyyy")}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8.5 text-xs gap-1.5 border-border/80 bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
}
