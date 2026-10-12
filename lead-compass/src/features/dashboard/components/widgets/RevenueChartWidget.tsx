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

/** Convert a monthly period to the date key expected by lightweight-charts. */
function periodToTime(period: string, index: number, totalCount: number = 12): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return period;
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    return `${period}-01`;3
  }

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
  title = "Monthly Closed-Won Bookings",
  subtitle = "Won deal value by close month",
  mode = "standard",
}: {
  data?: RevenueDataPoint[];
  isLoading?: boolean;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
  mode?: "standard" | "cashflow";
}) {
  const [timeframe, setTimeframe] = useState<"3M" | "6M" | "12M">("12M");
  const filteredData = data.slice(-(timeframe === "3M" ? 3 : timeframe === "6M" ? 6 : 12));
  const summary = filteredData.reduce(
    (totals, point) => ({
      bookings: totals.bookings + point.bookings,
      wonDeals: totals.wonDeals + point.wonDeals,
      invoiced: totals.invoiced + point.invoiced,
      collected: totals.collected + point.collected,
    }),
    { bookings: 0, wonDeals: 0, invoiced: 0, collected: 0 },
  );

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

  const hasActivity = mode === "cashflow"
    ? summary.invoiced > 0 || summary.collected > 0
    : summary.wonDeals > 0;

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {mode === "cashflow" ? "Cash Flow" : "Bookings"}
            </span>
          </div>
          <CardDescription className="text-xs">
            {subtitle} | {mode === "cashflow"
              ? `${formatCurrency(summary.invoiced)} invoiced | ${formatCurrency(summary.collected)} collected`
              : `${formatCurrency(summary.bookings)} booked | ${summary.wonDeals} deals won`}
          </CardDescription>
        </div>

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "3M" | "6M" | "12M")} className="w-auto">
          <TabsList className="h-8 text-xs bg-muted/60 p-0.5">
            <TabsTrigger value="3M" className="text-xs px-2.5 py-1">3M</TabsTrigger>
            <TabsTrigger value="6M" className="text-xs px-2.5 py-1">6M</TabsTrigger>
            <TabsTrigger value="12M" className="text-xs px-2.5 py-1">12M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-3">
        {!hasActivity ? (
          <div className="flex h-72 flex-col items-center justify-center text-center text-muted-foreground space-y-2">
            <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
            <p className="text-xs font-semibold text-foreground">
              {mode === "cashflow" ? "No invoices or payments in this period" : "No won deals in this period"}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {mode === "cashflow"
                ? "Issued invoices and collected payments will appear here by their respective dates."
                : "Bookings will appear here when deals move to a won stage."}
            </p>
          </div>
        ) : (
          <>
            <RevenueChart filteredData={filteredData} mode={mode} />
            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
              {mode === "cashflow" ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
                    <span>Invoiced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00a88f]" />
                    <span>Collected</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00a88f]" />
                  <span>Closed-won bookings</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

/** Inner component that lazy-loads the canvas chart */
const RevenueChart = memo(function RevenueChart({
  filteredData,
  mode,
}: {
  filteredData: RevenueDataPoint[];
  mode: "standard" | "cashflow";
}) {
  const series = useMemo(() => {
    const toSeriesData = (field: "bookings" | "invoiced" | "collected") =>
      filteredData.map((point, index) => ({
        time: periodToTime(point.period, index, filteredData.length),
        value: point[field],
      }));

    const makeSeries = (field: "bookings" | "invoiced" | "collected", color: string) => ({
      data: toSeriesData(field),
      color,
      topColor: `${color}40`,
      bottomColor: `${color}00`,
      lineWidth: 2 as const,
      lastValueVisible: true,
      priceLineVisible: false,
    });

    return mode === "cashflow"
      ? [makeSeries("invoiced", "#3B82F6"), makeSeries("collected", "#00A88F")]
      : [makeSeries("bookings", "#00A88F")];
  }, [filteredData, mode]);

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
          height={288}
          yAxisFormatter={yAxisFormatter}
          tooltipFormatter={currencyFormatter}
        />
      </Suspense>
    </div>
  );
});
