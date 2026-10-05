import { memo } from "react";
import { format } from "date-fns";
import {
  BriefcaseBusiness,
  FileText,
  RefreshCw,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/features/dashboard/configs/dashboard.config";
import type { DashboardRole } from "@/features/dashboard/types/dashboard.types";

export interface HomePrimaryAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface HomeHeaderProps {
  activeRole: DashboardRole;
  userName: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  primaryAction: HomePrimaryAction | null;
}

function HomeHeader({
  activeRole,
  userName,
  onRefresh,
  isRefreshing,
  primaryAction,
}: HomeHeaderProps) {
  const currentMeta = ROLE_LABELS[activeRole];
  const firstName = userName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const RoleIcon =
    activeRole === "ADMIN"
      ? ShieldCheck
      : activeRole === "MANAGER"
        ? Users
        : activeRole === "FINANCE"
          ? FileText
          : BriefcaseBusiness;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.09] via-card to-card px-5 py-5 shadow-sm sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <RoleIcon className="h-3.5 w-3.5" /> {currentMeta.badge}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Here's what's happening across your workspace. Pick up where you left off or get a head
            start on today's work.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-background/80"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />{" "}
            Refresh
          </Button>
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              <primaryAction.icon className="mr-2 h-4 w-4" /> {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(HomeHeader);
