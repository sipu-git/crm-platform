import { useMemo, lazy, Suspense } from "react";
import { Filter, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { STATUS_META, STATUS_ORDER } from "@/features/enquiries/utils/enquiries.constants";

// Lazy-load chart components to keep initial bundle small
const LightweightBarChart = lazy(() =>
  import("@/components/charts/LightweightBarChart").then((m) => ({
    default: m.LightweightBarChart,
  }))
);

const LightweightLineChart = lazy(() =>
  import("@/components/charts/LightweightLineChart").then((m) => ({
    default: m.LightweightLineChart,
  }))
);

export interface EnquiriesChartDataPoint {
  status: string;
  count: number;
  fill: string;
}

export interface EnquiriesTrendDataPoint {
  date: string;
  label: string;
  count: number;
}

interface EnquiriesChartsProps {
  statusChartData: EnquiriesChartDataPoint[];
  trendData: EnquiriesTrendDataPoint[];
}

export function EnquiriesCharts({ statusChartData, trendData }: EnquiriesChartsProps) {
  // Generate dynamic timestamps with distinct monthly spacing for status bar chart
  const barData = useMemo(() => {
    const today = new Date();
    return statusChartData.map((d, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (statusChartData.length - 1 - i), 1);
      return {
        time: date.toISOString().split("T")[0],
        value: d.count,
        color: d.fill,
      };
    });
  }, [statusChartData]);

  // Convert trend data dynamically using active dates
  const lineData = useMemo(() => {
    const today = new Date();
    return trendData.map((d, i) => {
      let time = d.date;
      if (!time || !/^\d{4}-\d{2}-\d{2}$/.test(time)) {
        const date = new Date(today);
        date.setDate(today.getDate() - (trendData.length - 1 - i));
        time = date.toISOString().split("T")[0];
      }
      return { time, value: d.count };
    });
  }, [trendData]);

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <Card className="border-border/70 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-muted-foreground" /> Status breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-lg" />}>
            <LightweightBarChart
              data={barData}
              height={220}
              defaultColor="#3b82f6"
            />
          </Suspense>
        </CardContent>
      </Card>

      <Card className="border-border/70 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> Enquiries received — last 14 days
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-lg" />}>
            <LightweightLineChart
              data={lineData}
              height={220}
              color="#3b82f6"
              lineWidth={2}
              showDots
            />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  );
}
