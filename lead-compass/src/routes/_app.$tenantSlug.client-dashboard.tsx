import { Link, useParams } from "react-router-dom";
import { FileText, FolderKanban, ReceiptText, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { useClientProjects } from "@/features/projects/hooks/useClientProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, TableSkeleton } from "@/components/ui-kit";

const statusMeta: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  OVERDUE: { label: "Overdue", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-border", icon: FileText },
};

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function ClientDashboardPage() {
  const { tenantSlug = "" } = useParams();
  const invoices = useInvoices();
  const projects = useClientProjects();
  const outstanding = (invoices.data ?? []).filter((invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED");
  const overdueCount = outstanding.filter((i) => daysUntil(i.due_date) < 0).length;
  const activeProjects = (projects.data ?? []).filter((p) => p.status === "IN_PROGRESS" || p.status === "NOT_STARTED");
  const isLoading = invoices.isLoading || projects.isLoading;

  return (
    <div>
      <PageHeader title="Your workspace" description="Projects, billing, and account updates for your organization." />
      <div className="space-y-6 p-6">
        {isLoading ? (
          <TableSkeleton rows={2} cols={3} />
        ) : (
          <>
            {/* Summary tiles — icon well, big number, contextual sub-line instead of a bare label */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                icon={<FolderKanban className="h-4.5 w-4.5" />}
                label="Projects"
                value={projects.data?.length ?? 0}
                sub={activeProjects.length > 0 ? `${activeProjects.length} in progress` : "All wrapped up"}
                to={`/${tenantSlug}/projects`}
                accent="text-primary bg-primary/10"
              />
              <SummaryCard
                icon={<ReceiptText className="h-4.5 w-4.5" />}
                label="Open invoices"
                value={outstanding.length}
                sub={overdueCount > 0 ? `${overdueCount} overdue` : outstanding.length > 0 ? "All within terms" : "Nothing due"}
                to={`/${tenantSlug}/invoices`}
                accent={overdueCount > 0 ? "text-destructive bg-destructive/10" : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"}
              />
              <SummaryCard
                icon={<FileText className="h-4.5 w-4.5" />}
                label="Account"
                value="Profile"
                sub="Company & contact details"
                to={`/${tenantSlug}/profile`}
                accent="text-muted-foreground bg-muted"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              {/* Billing — takes more width, richer rows with status + relative due date */}
              <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Billing at a glance</CardTitle>
                  {outstanding.length > 0 && (
                    <Link to={`/${tenantSlug}/invoices`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {!outstanding.length ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
                      <p className="text-sm text-muted-foreground">You're all caught up — no open invoices right now.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {outstanding.slice(0, 4).map((invoice) => {
                        const days = daysUntil(invoice.due_date);
                        const overdue = days < 0;
                        const status = overdue ? statusMeta.OVERDUE : statusMeta[invoice.status] ?? statusMeta.PENDING;
                        const StatusIcon = status.icon;
                        return (
                          <Link
                            key={invoice.id}
                            to={`/${tenantSlug}/invoices/${invoice.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 text-sm transition-colors hover:border-border hover:bg-muted/40"
                          >
                            <span className="flex min-w-0 items-center gap-2.5 font-medium">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                                <FileText className="h-4 w-4" />
                              </span>
                              <span className="truncate">{invoice.invoice_number}</span>
                            </span>
                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {overdue ? `${Math.abs(days)}d overdue` : `Due in ${days}d`}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active projects preview — new, gives the dashboard a second point of substance */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Active projects</CardTitle>
                  {activeProjects.length > 0 && (
                    <Link to={`/${tenantSlug}/projects`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {!activeProjects.length ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No active projects right now.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeProjects.slice(0, 4).map((project) => (
                        <Link
                          key={project.id}
                          to={`/${tenantSlug}/projects`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 text-sm transition-colors hover:border-border hover:bg-muted/40"
                        >
                          <span className="flex min-w-0 items-center gap-2.5 font-medium">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                              <FolderKanban className="h-4 w-4" />
                            </span>
                            <span className="truncate">{project.project_name}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {project.status.replaceAll("_", " ")}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon, label, value, sub, to, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
  to: string;
  accent: string;
}) {
  return (
    <Link to={to} className="group rounded-xl border bg-card p-4 shadow-xs transition-all hover:border-border hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${accent}`}>{icon}</div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Link>
  );
}