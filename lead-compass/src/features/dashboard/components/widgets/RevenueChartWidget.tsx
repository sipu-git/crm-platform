import { useState, useMemo, memo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Inbox } from "lucide-react";
import type { RevenueDataPoint, WidgetScope } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/features/dashboard/hooks/useDashboardData";

// Lazy-load the heavy canvas chart (lightweight-charts) so it doesn't block LCP
const LightweightAreaChart = lazy(() =>
  import("@/components/charts/LightweightAreaChart").then((m) => ({
    default: m.LightweightAreaChart,
  }))
);

/** Convert period strings (e.g. "Jan 2025", "2024-01", "Jan") to strictly ascending YYYY-MM-DD date strings for lightweight-charts */
function periodToTime(period: string, index: number, totalCount: number = 12): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return period;
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    return `${period}-01`;
  }

  // Parse explicit month and year from string e.g. "Jan 2025" or "Jan '25"
  const yearMatch = period.match(/\b(20\d{2}|\d{2})\b/);
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const mIndex = monthNames.findIndex((m) => period.toLowerCase().includes(m));

  if (mIndex !== -1 && yearMatch) {
    const rawY = parseInt(yearMatch[1], 10);
    const fullY = rawY < 100 ? 2000 + rawY : rawY;
    const mStr = String(mIndex + 1).padStart(2, "0");
    return `${fullY}-${mStr}-01`;
  }

  // Fallback: Rolling 12-month window ending in current month
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - (totalCount - 1 - index), 1);
  const yStr = targetDate.getFullYear();
  const mStr = String(targetDate.getMonth() + 1).padStart(2, "0");
  return `${yStr}-${mStr}-01`;
}

export const RevenueChartWidget = memo(function RevenueChartWidget({
  data = [],
  isLoading,
  scope,
  title = "Revenue Performance & Target",
  subtitle = "Monthly recurring revenue, closed ARR, and projection targets",
  showTargetLine = true,
  mode = "standard",
}: {
  data?: RevenueDataPoint[];
  isLoading?: boolean;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
  showTargetLine?: boolean;
  mode?: "standard" | "cashflow";
}) {
  const [timeframe, setTimeframe] = useState<"30D" | "90D" | "12M">("12M");

  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="pt-2">
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {mode === "cashflow" ? "Cash Flow" : "Revenue"}
              </span>
            </div>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No revenue transactions recorded</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Revenue trends will populate automatically once paid invoices or closed-won deals are logged.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredData =
    timeframe === "30D"
      ? data.slice(-3)
      : timeframe === "90D"
      ? data.slice(-6)
      : data;

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {mode === "cashflow" ? "Cash Flow" : "ARR / MRR"}
            </span>
          </div>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="w-auto">
          <TabsList className="h-8 text-xs bg-muted/60 p-0.5">
            <TabsTrigger value="30D" className="text-xs px-2.5 py-1">30D</TabsTrigger>
            <TabsTrigger value="90D" className="text-xs px-2.5 py-1">90D</TabsTrigger>
            <TabsTrigger value="12M" className="text-xs px-2.5 py-1">12M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-3">
        <RevenueChart
          filteredData={filteredData}
          mode={mode}
          showTargetLine={showTargetLine}
        />

        <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>Actual Realized</span>
          </div>
          {showTargetLine && (
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Target Quota</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/** Inner component that lazy-loads the canvas chart */
const RevenueChart = memo(function RevenueChart({
  filteredData,
  mode,
  showTargetLine,
}: {
  filteredData: RevenueDataPoint[];
  mode: "standard" | "cashflow";
  showTargetLine: boolean;
}) {
  const { series, lineOverlays } = useMemo(() => {
    const areaData = filteredData.map((d, i) => ({
      time: periodToTime(d.period, i, filteredData.length),
      value: mode === "cashflow" ? (d.collected ?? d.revenue) : d.revenue,
    }));

    const areaSeries = [
      {
        data: areaData,
        color: "hsl(221, 83%, 53%)",
        topColor: "hsla(221, 83%, 53%, 0.35)",
        bottomColor: "hsla(221, 83%, 53%, 0)",
        lineWidth: 2 as const,
      },
    ];

    const overlays = showTargetLine
      ? [
          {
            data: filteredData.map((d, i) => ({
              time: periodToTime(d.period, i, filteredData.length),
              value: d.target,
            })),
            color: "#F59E0B",
            lineWidth: 2 as const,
            lineStyle: "dashed" as const,
          },
        ]
      : [];

    return { series: areaSeries, lineOverlays: overlays };
  }, [filteredData, mode, showTargetLine]);

  const currencyFormatter = useMemo(
    () => (value: number) => formatCurrency(value),
    [],
  );

  const yAxisFormatter = useMemo(
    () => (value: number) => {
      const absVal = Math.abs(value);
      if (absVal < 0.01) return "₹0";
      if (absVal >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
      if (absVal >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
      if (absVal >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
      return `₹${Math.round(value)}`;
    },
    [],
  );

  return (
    <div className="h-72 w-full">
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-lg" />}>
        <LightweightAreaChart
          series={series}
          lineOverlays={lineOverlays}
          height={288}
          yAxisFormatter={yAxisFormatter}
          tooltipFormatter={currencyFormatter}
        />
      </Suspense>
    </div>
  );
});
