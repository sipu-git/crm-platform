import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AlertItem, WidgetScope } from "@/features/dashboard/dashboard.types";

const SEVERITY_CONFIG = {
  critical: {
    border: "border-red-500/30 bg-red-500/5",
    icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/40",
  },
  warning: {
    border: "border-amber-500/30 bg-amber-500/5",
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/40",
  },
  info: {
    border: "border-blue-500/30 bg-blue-500/5",
    icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/40",
  },
};

export function AlertBannerWidget({
  alerts = [],
  isLoading,
  scope,
  title = "Critical Alerts & Notices",
  subtitle = "High risk items requiring team attention",
}: {
  alerts?: AlertItem[];
  isLoading?: boolean;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleAction = (alert: AlertItem) => {
    if (alert.actionUrl) {
      navigate(alert.actionUrl);
    } else {
      toast.success(`Action handled: ${alert.title}`);
    }
  };

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {alerts.length} Active
            </span>
          </div>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-0 px-6 pb-4">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <span>All systems and accounts operational. No active alerts.</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border space-y-2 transition-all ${config.border}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {alert.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {alert.description}
                </p>

                {alert.actionLabel && (
                  <div className="pt-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(alert)}
                      className="h-7 text-xs px-2.5 bg-background hover:bg-muted"
                    >
                      {alert.actionLabel}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

