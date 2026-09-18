import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Inbox } from "lucide-react";
import type { RevenueDataPoint, WidgetScope } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/features/dashboard/hooks/useDashboardData";

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
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="period"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === "revenue"
                    ? "Invoiced / Revenue"
                    : name === "collected"
                    ? "Cash Collected"
                    : "Target Goal",
                ]}
                labelStyle={{ fontWeight: "bold", color: "var(--foreground)" }}
              />
              <Area
                type="monotone"
                dataKey={mode === "cashflow" ? "collected" : "revenue"}
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                name="revenue"
              />
              {showTargetLine && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="target"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
