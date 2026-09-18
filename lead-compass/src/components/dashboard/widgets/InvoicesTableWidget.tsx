import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Inbox } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import type { WidgetScope } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/features/dashboard/hooks/useDashboardData";

interface InvoiceRow {
  id: string;
  invoice_number?: string;
  number?: string;
  total_amount?: number;
  total?: number;
  status: string;
  due_date?: string;
  issue_date?: string;
  client_name?: string;
  deal?: { title?: string };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/40" },
  SENT: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/40" },
  OVERDUE: { label: "Overdue", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/40" },
  DRAFT: { label: "Draft", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/40" },
};

export function InvoicesTableWidget({
  invoices = [],
  isLoading,
  scope,
  title = "Invoices Ledger & Aging",
  subtitle = "Recent billing statements, payment terms, and status",
  limit = 5,
}: {
  invoices?: InvoiceRow[];
  isLoading?: boolean;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const navigate = useNavigate();
  const { tenantSlug = "" } = useParams();

  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <FileText className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No invoices found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Issued billing invoices and payment statuses will be tracked here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayInvoices = invoices.slice(0, limit);

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {displayInvoices.length} Recent
            </span>
          </div>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
          <FileText className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="p-0 px-6 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-left">
                <th className="pb-2 font-medium">Invoice #</th>
                <th className="pb-2 font-medium">Client / Account</th>
                <th className="pb-2 font-medium">Due Date</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {displayInvoices.map((inv) => {
                const num = inv.invoice_number || inv.number || `#INV-${inv.id.slice(0, 6)}`;
                const client = inv.client_name || inv.deal?.title || "Enterprise Client";
                const amount = Number(inv.total_amount || inv.total || 0);
                const statusMeta = STATUS_CONFIG[inv.status] || STATUS_CONFIG.SENT;
                let formattedDate = "Net 30";
                if (inv.due_date) {
                  try {
                    formattedDate = format(new Date(inv.due_date), "dd MMM yyyy");
                  } catch {
                    formattedDate = "Net 30";
                  }
                }

                return (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/${tenantSlug}/invoices/${inv.id}`)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-semibold text-foreground">{num}</td>
                    <td className="py-2.5 font-sans font-medium text-muted-foreground truncate max-w-[160px]">
                      {client}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{formattedDate}</td>
                    <td className="py-2.5 text-right font-semibold text-foreground">
                      {formatCurrency(amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-sans font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
