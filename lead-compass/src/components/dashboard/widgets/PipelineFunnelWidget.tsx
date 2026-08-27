import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Inbox } from "lucide-react";
import type { FunnelStage, WidgetScope } from "@/features/dashboard/dashboard.types";
import { formatCurrency } from "@/features/dashboard/useDashboardData";

export function PipelineFunnelWidget({
  stages = [],
  isLoading,
  scope,
}: {
  stages?: FunnelStage[];
  isLoading?: boolean;
  scope?: WidgetScope;
}) {
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Pipeline Stage Velocity</CardTitle>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {scope === "own" ? "My Deals" : scope === "team" ? "Team Pipeline" : "Org Funnel"}
              </span>
            </div>
            <CardDescription className="text-xs">Stage conversion & deal volume</CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Layers className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No active deals found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            There are currently no active deal opportunities in your pipeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const totalPipelineVal = stages.reduce((acc, s) => acc + s.value, 0);

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Pipeline Stage Velocity</CardTitle>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {scope === "own" ? "My Deals" : scope === "team" ? "Team Pipeline" : "Org Funnel"}
            </span>
          </div>
          <CardDescription className="text-xs">
            Total active pipeline:{" "}
            <span className="font-semibold text-foreground font-mono">
              {formatCurrency(totalPipelineVal)}
            </span>
          </CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Layers className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(Math.round((stage.count / maxCount) * 100), 12);
          const isFinal = index === stages.length - 1;

          return (
            <div key={stage.id} className="group space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-muted text-[10px] font-mono text-muted-foreground font-bold">
                    {index + 1}
                  </span>
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {stage.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-muted-foreground">{stage.count} deals</span>
                  <span className="font-semibold text-foreground">{formatCurrency(stage.value)}</span>
                </div>
              </div>

              {/* Progress bar with conversion rate */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFinal
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : "bg-primary/80 group-hover:bg-primary"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {/* Conversion pill */}
              <div className="flex justify-end text-[10px] text-muted-foreground/80">
                <span>{stage.conversionRate}% conversion from top</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
