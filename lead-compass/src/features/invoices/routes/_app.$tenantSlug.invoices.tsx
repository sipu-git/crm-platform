import { Link, useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { PageHeader, TableSkeleton, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const STATUS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
  PAID: "bg-success/15 text-success",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground line-through",
};

import { formatCurrency } from "@/lib/currency";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { InvoiceStatus } from "@/features/invoices/types/invoices.type";

const fmt = (n: number, _currency?: string) => formatCurrency(n);

export function InvoicesPage() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading: loading, isError } = useInvoices();
  const { tenantSlug = "" } = useParams();
  const auth = useAuthPayload()
  const isClient = auth?.user.role === "CLIENT";

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={isClient ? "Review invoices and payment status for your projects." : "Send, track, and get paid."}
        actions={
          !isClient ? <Button onClick={() => navigate(`/${tenantSlug}/invoices/new`)}>
            <Plus className="mr-2 h-4 w-4" /> New invoice
          </Button> : undefined
        }
      />

      <div className="space-y-4 p-6">
        {isError && <p role="alert" className="text-sm text-destructive">Could not load invoices. Please try again.</p>}
        {loading && (!invoices || invoices.length === 0) && <TableSkeleton />}
        {!loading && (!invoices || invoices.length === 0) && (
          <EmptyState title="No invoices yet" description="Create your first invoice to get paid faster." />
        )}
        {invoices && invoices.length > 0 && (
          <div className="overflow-hidden rounded-md border bg-card">
            <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Invoice</th>
                    <th className="px-3 py-2 font-medium">Buyer</th>
                    <th className="px-3 py-2 font-medium">Issue date</th>
                    <th className="px-3 py-2 font-medium">Due date</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/40">
                      <td className="px-3 py-2 font-medium">
                        <Link
                          to={`/${tenantSlug}/invoices/${inv.id}`}
                          className="hover:underline"
                        >
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{inv.buyer_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(inv.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{fmt(Number(inv.total_amount), inv.currency)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS[inv.status]}`}
                        >
                          {inv.status.replace("_", " ").toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
