import { Link } from "react-router-dom";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui-kit";
import { FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

// Helper to calculate days until a date string
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Status meta used for badge styling and icons
const statusMeta: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  OVERDUE: { label: "Overdue", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-border", icon: FileText },
};

/**
 * InvoiceList – a lightweight list of recent invoices for the client dashboard.
 *
 * Displays up to 4 of the most recent open invoices with status badges.
 * Shows a loading skeleton while invoices are being fetched.
 */
export function InvoiceList({ tenantSlug }: { tenantSlug: string }) {
  const { data = [], isLoading } = useInvoices();

  // Filter to only open (non‑paid, non‑cancelled) invoices
  const outstanding = data.filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent invoices</CardTitle>
        {outstanding.length > 0 && (
          <Link
            to={`/${tenantSlug}/invoices`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={2} cols={3} />
        ) : outstanding.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
            <p className="text-sm text-muted-foreground">All invoices are paid.</p>
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
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
                  >
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
  );
}

