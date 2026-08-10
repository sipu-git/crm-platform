import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {fetchInvoices,selectInvoices,selectInvoicesLoading} from "@/features/invoices/service2/slice";
import type { InvoiceStatus } from "@/features/invoices/service2/types";
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

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function InvoicesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(selectInvoices);
  const loading = useAppSelector(selectInvoicesLoading);
  const { tenantSlug = "" } = useParams();

  useEffect(() => {
    dispatch(fetchInvoices({}));
  }, [dispatch]);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Send, track, and get paid."
        actions={
          <Button onClick={() => navigate(`/${tenantSlug}/invoices/new`)}>
            <Plus className="mr-2 h-4 w-4" /> New invoice
          </Button>
        }
      />

      <div className="space-y-4 p-6">
        {loading && (!invoices || invoices.length === 0) && <TableSkeleton />}
        {!loading && (!invoices || invoices.length === 0) && (
          <EmptyState title="No invoices yet" description="Create your first invoice to get paid faster." />
        )}
        {invoices && invoices.length > 0 && (
          <div className="overflow-hidden rounded-lg border bg-card">
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
        )}
      </div>
    </div>
  );
}