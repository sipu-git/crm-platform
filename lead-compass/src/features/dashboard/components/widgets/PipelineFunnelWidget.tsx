import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Inbox, Filter } from "lucide-react";
import { SVGFunnelChart } from "@/components/charts/SVGFunnelChart";
import type { FunnelStage, WidgetScope } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/features/dashboard/hooks/useDashboardData";

const FUNNEL_COLORS = [
  "#3B82F6", // Blue - Top of Funnel / New
  "#8B5CF6", // Violet - Discovery / Contacted
  "#F59E0B", // Amber - Proposal / Qualified
  "#10B981", // Emerald - Closed / Won
  "#6366F1", // Indigo - Converted
];

export const PipelineFunnelWidget = memo(function PipelineFunnelWidget({
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
      <Card className="border border-border/60 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <Skeleton className="h-56 w-full rounded-lg" />
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

  const totalPipelineVal = stages.reduce((acc, s) => acc + s.value, 0);

  // Format chart data for SVGFunnelChart
  const chartData = stages.map((stage, idx) => ({
    name: stage.name,
    value: stage.count > 0 ? stage.count : 1,
    dealCount: stage.count,
    amount: stage.value,
    conversionRate: stage.conversionRate,
    fill: FUNNEL_COLORS[idx % FUNNEL_COLORS.length],
  }));

  const renderTooltip = useCallback(
    (item: any) => (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
          {item.name}
        </p>
        <div className="text-muted-foreground space-y-0.5 font-mono">
          <p>Deals: <strong className="text-foreground">{item.dealCount}</strong></p>
          <p>Value: <strong className="text-foreground">{formatCurrency(item.amount)}</strong></p>
          <p>Conversion: <strong className="text-emerald-500">{item.conversionRate}%</strong></p>
        </div>
      </div>
    ),
    [],
  );

  const labelFormatter = useCallback(
    (item: any) => `${item.dealCount} deal${Number(item.dealCount) === 1 ? "" : "s"}`,
    [],
  );

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Pipeline Funnel</CardTitle>
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
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground shrink-0">
          <Filter className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-2 pb-4">
        {/* SVG Funnel Chart — replaces Recharts FunnelChart */}
        <div className="w-full h-48 shrink-0 flex items-center justify-center">
          <SVGFunnelChart
            data={chartData}
            width={320}
            height={192}
            renderTooltip={renderTooltip}
            labelFormatter={labelFormatter}
          />
        </div>

        {/* Clean Stage Legend & Conversion Breakdown */}
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs min-w-0 border border-border/40"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}
                />
                <span className="font-medium text-foreground truncate">{stage.name}</span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="font-semibold text-foreground">{stage.count}</span>
                <span className="text-[10px] text-emerald-500 font-semibold ml-1.5">{stage.conversionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
