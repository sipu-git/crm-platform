import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchInvoices,
  invoicesSelectors,
  updateInvoice,
  deleteInvoice,
} from "@/features/invoices/slice";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { Invoice, InvoiceStatus, InvoiceLine } from "@/lib/mockDb";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/$tenantSlug/invoices/$invoiceId")({
  ssr: false,
  component: InvoiceDetail,
});

const STEPS: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function InvoiceDetail() {
  const { tenantSlug, invoiceId } = Route.useParams();
  const dispatch = useAppDispatch();
  const invoice = useAppSelector((s) => invoicesSelectors.selectById(s, invoiceId));
  const [draft, setDraft] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!invoice) dispatch(fetchInvoices(tenantSlug));
  }, [dispatch, invoice, tenantSlug]);

  useEffect(() => {
    if (invoice) setDraft(invoice);
  }, [invoice]);

  const total = useMemo(
    () => (draft?.lines ?? []).reduce((s, l) => s + l.quantity * l.unitPrice, 0),
    [draft],
  );

  if (!draft) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading invoice…</div>
    );
  }

  function updateLine(id: string, patch: Partial<InvoiceLine>) {
    setDraft((d) =>
      d ? { ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) } : d,
    );
  }
  function addLine() {
    setDraft((d) =>
      d
        ? {
            ...d,
            lines: [
              ...d.lines,
              {
                id: Math.random().toString(36).slice(2),
                description: "",
                quantity: 1,
                unitPrice: 0,
              },
            ],
          }
        : d,
    );
  }
  function removeLine(id: string) {
    setDraft((d) => (d ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));
  }

  return (
    <div>
      <PageHeader
        title={draft.number}
        description={`${draft.clientName} • Due ${new Date(draft.dueDate).toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/${tenantSlug}/invoices`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await dispatch(deleteInvoice({ tenantSlug, id: draft.id }));
                toast.success("Deleted");
              }}
            >
              Delete
            </Button>
            <Button
              onClick={async () => {
                await dispatch(updateInvoice({ tenantSlug, id: draft.id, changes: draft }));
                toast.success("Saved");
              }}
            >
              Save
            </Button>
          </div>
        }
      />
      <div className="space-y-6 p-6">
        <StatusStepper
          value={draft.status}
          onChange={(v) => setDraft({ ...draft, status: v })}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 py-4">
              <Field label="Client name">
                <Input value={draft.clientName} onChange={(e) => setDraft({ ...draft, clientName: e.target.value })} />
              </Field>
              <Field label="Client email">
                <Input value={draft.clientEmail} onChange={(e) => setDraft({ ...draft, clientEmail: e.target.value })} />
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 py-4">
              <Field label="Issue date">
                <Input
                  type="date"
                  value={draft.issueDate.slice(0, 10)}
                  onChange={(e) => setDraft({ ...draft, issueDate: new Date(e.target.value).toISOString() })}
                />
              </Field>
              <Field label="Due date">
                <Input
                  type="date"
                  value={draft.dueDate.slice(0, 10)}
                  onChange={(e) => setDraft({ ...draft, dueDate: new Date(e.target.value).toISOString() })}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Line items</h3>
              <Button size="sm" variant="outline" onClick={addLine}>
                <Plus className="mr-2 h-4 w-4" /> Add line
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="w-20 px-3 py-2 font-medium">Qty</th>
                    <th className="w-28 px-3 py-2 font-medium">Unit price</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
                    <th className="w-10 px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {draft.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2">
                        <Input value={l.description} onChange={(e) => updateLine(l.id, { description: e.target.value })} />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" value={l.quantity} onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) })} />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" value={l.unitPrice} onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) })} />
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{fmt(l.quantity * l.unitPrice)}</td>
                      <td className="px-3 py-2">
                        <Button size="icon" variant="ghost" onClick={() => removeLine(l.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td>
                    <td className="px-3 py-2 text-right text-base font-semibold">{fmt(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusStepper({
  value,
  onChange,
}: {
  value: InvoiceStatus;
  onChange: (v: InvoiceStatus) => void;
}) {
  const currentIdx = STEPS.indexOf(value);
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
      {STEPS.map((s, i) => {
        const active = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm capitalize transition-colors",
              isCurrent && "bg-primary text-primary-foreground",
              !isCurrent && active && "bg-primary/10 text-primary",
              !active && "text-muted-foreground hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold",
                isCurrent && "border-primary-foreground/40 bg-primary-foreground/20",
                !isCurrent && active && "border-primary/40 bg-primary/20",
              )}
            >
              {i + 1}
            </span>
            {s}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
