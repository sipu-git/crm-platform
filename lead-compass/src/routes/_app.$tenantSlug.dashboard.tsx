import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { PageHeader, KPISkeleton } from "@/components/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DollarSign, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { formatDistanceToNow, format, startOfMonth, subMonths, isBefore } from "date-fns";
import { fetchDeals, selectDeals, selectDealsLoading } from "@/features/deals/slice";
import { activitiesSelectors, fetchActivities } from "@/features/activities/slice";
import { viewLeads } from "@/features/leads/service1/slice";
import { fetchInvoices, selectInvoices, selectInvoicesLoading } from "@/features/invoices/service2/slice";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const deals = useSelector(selectDeals);
  const dealsLoading = useSelector(selectDealsLoading);

  const activities = useSelector(activitiesSelectors.selectAll);

  const leads = useSelector((s: RootState) => s.leads.leads ?? []);
  const leadsLoading = useSelector((s: RootState) => s.leads.loading);

  const invoices = useSelector(selectInvoices) ?? [];
  const invoicesLoading = useSelector(selectInvoicesLoading);

  const loading = dealsLoading || leadsLoading || invoicesLoading;

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(viewLeads());
    dispatch(fetchActivities({}));
    dispatch(fetchInvoices({}));
  }, [dispatch]);

  const kpis = useMemo(() => {
    const openDeals = deals.filter((d) => !d.pipeline?.is_won && !d.pipeline?.is_lost);
    const pipelineValue = openDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const now = new Date();
    const overdueInvoices = invoices.filter(
      (inv) => inv.status !== "PAID" && inv.due_date && isBefore(new Date(inv.due_date), now)
    ).length;

    return {
      openDeals: openDeals.length,
      pipelineValue,
      overdueInvoices,
      totalLeads: leads.length,
    };
  }, [deals, leads, invoices]);

  const byStage = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    deals.forEach((d) => {
      const stageName = d.pipeline?.name ?? "Unknown";
      const entry = map.get(stageName) || { count: 0, value: 0 };
      entry.count += 1;
      entry.value += Number(d.amount || 0);
      map.set(stageName, entry);
    });
    return Array.from(map.entries()).map(([stage, v]) => ({ stage, ...v }));
  }, [deals]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      map.set(format(startOfMonth(subMonths(new Date(), i)), "MMM yyyy"), 0);
    }
    invoices.filter((inv) => inv.issue_date && inv.status === "PAID").forEach((inv) => {
      const key = format(startOfMonth(new Date(inv.issue_date)), "MMM yyyy");
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(inv.total_amount || 0));
    });
    return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }));
  }, [invoices]);

  const recentActivity = useMemo(() => [...activities]
    .sort((a, b) => ((a.created_at ?? "") < (b.created_at ?? "") ? 1 : -1))
    .slice(0, 10),
    [activities],
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your pipeline, invoices and recent activity."
      />
      <div className="space-y-6 p-6">
        {loading && <KPISkeleton />}

        {!loading && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard label="Open deals" value={(kpis.openDeals ?? 0).toString()} icon={<TrendingUp className="h-4 w-4" />} />
              <KPICard label="Pipeline value" value={fmtMoney(kpis.pipelineValue ?? 0)} icon={<DollarSign className="h-4 w-4" />} />
              <KPICard label="Overdue invoices" value={(kpis.overdueInvoices ?? 0).toString()} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
              <KPICard label="Total leads" value={(kpis.totalLeads ?? 0).toString()} icon={<Users className="h-4 w-4" />} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-sm font-medium">Revenue trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickFormatter={(value: number) => fmtMoney(value)}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                          formatter={(value: number) => [fmtMoney(value), "Revenue"]}
                          labelFormatter={(label: string) => label}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Deals by stage</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byStage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Recent activity</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {recentActivity.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-medium uppercase text-accent-foreground">
                        {a.created_at?.[0]}
                      </span>
                      <span className="flex-1 truncate">{a.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at ?? ""), { addSuffix: true })}
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

function KPICard({ label, value, icon, tone }: { label: string; value: string; icon?: React.ReactNode; tone?: "warning" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className={tone === "warning" ? "text-warning" : "text-muted-foreground"}>{icon}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}