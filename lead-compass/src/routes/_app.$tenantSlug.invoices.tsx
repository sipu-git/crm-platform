import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createInvoice,
  fetchInvoices,
  invoicesSelectors,
} from "@/features/invoices/slice";
import { PageHeader, TableSkeleton, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/lib/mockDb";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/$tenantSlug/invoices")({
  ssr: false,
  component: InvoicesPage,
});

const STATUS: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/15 text-success",
  overdue: "bg-destructive/15 text-destructive",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function InvoicesPage() {
  const { tenantSlug } = Route.useParams();
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(invoicesSelectors.selectAll);
  const status = useAppSelector((s) => s.invoices.status);

  useEffect(() => {
    dispatch(fetchInvoices(tenantSlug));
  }, [dispatch, tenantSlug]);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Send, track, and get paid."
        actions={
          <Button
            onClick={async () => {
              const res = await dispatch(
                createInvoice({
                  tenantSlug,
                  input: {
                    clientName: "New Client",
                    clientEmail: "billing@client.com",
                    status: "draft",
                    lines: [{ id: Math.random().toString(36).slice(2), description: "Service", quantity: 1, unitPrice: 1000 }],
                    issueDate: new Date().toISOString(),
                    dueDate: new Date(Date.now() + 15 * 86400_000).toISOString(),
                  },
                }),
              );
              if (createInvoice.fulfilled.match(res)) {
                toast.success("Draft invoice created");
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> New invoice
          </Button>
        }
      />

      <div className="space-y-4 p-6">
        {status === "loading" && invoices.length === 0 && <TableSkeleton />}
        {status !== "loading" && invoices.length === 0 && (
          <EmptyState title="No invoices yet" description="Create your first invoice to get paid faster." />
        )}
        {invoices.length > 0 && (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Invoice</th>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Issue date</th>
                  <th className="px-3 py-2 font-medium">Due date</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((i) => {
                  const total = i.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
                  return (
                    <tr key={i.id} className="hover:bg-muted/40">
                      <td className="px-3 py-2 font-medium">
                        <Link
                          to={`/${tenantSlug}/invoices/${i.id}`}
                          className="hover:underline"
                        >
                          {i.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{i.clientName}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(i.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(i.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{fmt(total)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS[i.status]}`}
                        >
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
