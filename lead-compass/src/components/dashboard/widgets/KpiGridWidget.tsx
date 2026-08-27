import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  DollarSign,
  Users,
  Award,
  Zap,
  Target,
  CheckCircle2,
  Briefcase,
  Trophy,
  PhoneCall,
  CreditCard,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { KpiMetric, WidgetScope } from "@/features/dashboard/dashboard.types";

const ICONS_MAP: Record<string, ReactNode> = {
  DollarSign: <IndianRupee className="h-4 w-4" />,
  IndianRupee: <IndianRupee className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  PhoneCall: <PhoneCall className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  Clock: <Clock className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
};

const SCOPE_BADGES: Record<WidgetScope, { label: string; className: string }> = {
  own: { label: "Personal", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/40" },
  team: { label: "Team", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/40" },
  org: { label: "Org Wide", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/40" },
};

export function KpiCard({ metric, isLoading }: { metric: KpiMetric; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = (metric.changePercent ?? 0) >= 0;
  const icon = ICONS_MAP[metric.iconName] || <TrendingUp className="h-4 w-4" />;
  const scopeMeta = metric.scope ? SCOPE_BADGES[metric.scope] : null;

  return (
    <Card className="group relative overflow-hidden border border-border/70 bg-card hover:border-border transition-all duration-200 hover:shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate">{metric.label}</span>
            {scopeMeta && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${scopeMeta.className}`}>
                {scopeMeta.label}
              </span>
            )}
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
            {icon}
          </div>
        </div>

        {/* Large Value */}
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono sm:text-3xl">
            {metric.formattedValue}
          </div>

          {metric.progressPercent !== undefined && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                <span>Pacing</span>
                <span>{metric.progressPercent}%</span>
              </div>
              <Progress value={metric.progressPercent} className="h-1.5" />
            </div>
          )}
        </div>

        {/* Footer Change Indicator */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          {metric.changePercent !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {metric.changePercent}%
            </span>
          )}
          {metric.changePeriod && (
            <span className="text-muted-foreground/80 truncate text-[11px]">{metric.changePeriod}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiGridWidget({
  metrics,
  isLoading,
  scope,
}: {
  metrics: KpiMetric[];
  isLoading?: boolean;
  scope?: WidgetScope;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCard key={i} metric={{} as any} isLoading />
        ))}
      </div>
    );
  }

  const gridCols =
    metrics.length === 5
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {metrics.map((metric) => (
        <KpiCard key={metric.id} metric={{ ...metric, scope: metric.scope || scope }} />
      ))}
    </div>
  );
}

