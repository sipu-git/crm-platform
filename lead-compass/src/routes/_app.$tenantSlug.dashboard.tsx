import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { PageHeader, KPISkeleton } from "@/components/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/$tenantSlug/dashboard")({
  ssr: false,
  component: DashboardPage,
});

interface KPIs {
  openDeals: number;
  pipelineValue: number;
  overdueInvoices: number;
  totalLeads: number;
}
interface ByStage {
  stage: string;
  count: number;
  value: number;
}
interface Trend {
  month: string;
  revenue: number;
}
interface Activity {
  id: string;
  kind: string;
  message: string;
  createdAt: string;
}
interface DashboardData {
  kpis: KPIs;
  byStage: ByStage[];
  trend: Trend[];
  activity: Activity[];
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function DashboardPage() {
  const { tenantSlug } = Route.useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardData>(`/${tenantSlug}/dashboard`);
      setData(res.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your pipeline, invoices and recent activity."
      />

      <div className="space-y-6 p-6">
        {loading && <KPISkeleton />}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}{" "}
            <button className="ml-2 underline" onClick={load}>
              Retry
            </button>
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Open deals"
                value={data.kpis.openDeals.toString()}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <KPICard
                label="Pipeline value"
                value={fmtMoney(data.kpis.pipelineValue)}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KPICard
                label="Overdue invoices"
                value={data.kpis.overdueInvoices.toString()}
                icon={<AlertTriangle className="h-4 w-4" />}
                tone="warning"
              />
              <KPICard
                label="Total leads"
                value={data.kpis.totalLeads.toString()}
                icon={<Users className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Revenue trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Deals by stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byStage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {data.activity.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-medium uppercase text-accent-foreground">
                        {a.kind[0]}
                      </span>
                      <span className="flex-1 truncate">{a.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "warning";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className={
              tone === "warning"
                ? "text-warning"
                : "text-muted-foreground"
            }
          >
            {icon}
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
