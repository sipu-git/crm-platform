import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {fetchInvoice,updateInvoice,deleteInvoice,markInvoicePaid,selectInvoiceDetail,selectInvoicesLoading} from "@/features/invoices/service2/slice";
import {
  createInvoiceItem,
  updateInvoiceItem,
  deleteInvoiceItem,
} from "@/features/invoices/service1/slice";
import type { CreateInvoiceLineItemInput } from "@/features/invoices/service2/types";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
  PAID: "bg-success/15 text-success",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground line-through",
};

const EMPTY_LINE: CreateInvoiceLineItemInput = {
  description: "",
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  cgst_rate: 0,
  sgst_rate: 0,
  igst_rate: 0,
};

export function InvoiceDetail() {
  const { tenantSlug = "", invoiceId = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const invoice = useAppSelector(selectInvoiceDetail);
  const loading = useAppSelector(selectInvoicesLoading);

  const [buyerDraft, setBuyerDraft] = useState({
    buyer_name: "", buyer_gstin: "", buyer_address: "", buyer_state: "",
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<CreateInvoiceLineItemInput>(EMPTY_LINE);
  const [addingLine, setAddingLine] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoiceId) dispatch(fetchInvoice(invoiceId));
  }, [dispatch, invoiceId]);

  useEffect(() => {
    if (invoice) {
      setBuyerDraft({
        buyer_name: invoice.buyer_name,
        buyer_gstin: invoice.buyer_gstin ?? "",
        buyer_address: invoice.buyer_address ?? "",
        buyer_state: invoice.buyer_state ?? "",
      });
    }
  }, [invoice]);

  if (loading && !invoice) {
    return <div className="p-6 text-sm text-muted-foreground">Loading invoice…</div>;
  }
  if (!invoice) {
    return <div className="p-6 text-sm text-muted-foreground">Invoice not found.</div>;
  }

  const isDraft = invoice.status === "DRAFT";
  const items = invoice.items ?? [];

  async function saveBuyerDetails() {
    setSaving(true);
    try {
      await dispatch(updateInvoice({ id: invoice!.id, changes: buyerDraft })).unwrap();
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    try {
      await dispatch(updateInvoice({ id: invoice!.id, changes: { status: "SENT" } })).unwrap();
      toast.success("Invoice sent");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleCancel() {
    try {
      await dispatch(updateInvoice({ id: invoice!.id, changes: { status: "CANCELLED" } })).unwrap();
      toast.success("Invoice cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  }

  async function handleMarkPaid() {
    try {
      await dispatch(markInvoicePaid(invoice!.id)).unwrap();
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to mark as paid");
    }
  }

  async function handleDelete() {
    try {
      await dispatch(deleteInvoice(invoice!.id)).unwrap();
      toast.success("Invoice deleted");
      navigate(`/${tenantSlug}/invoices`);
    } catch {
      toast.error("Failed to delete — only draft invoices can be deleted");
    }
  }

  async function saveNewLine() {
    if (!itemDraft.description.trim()) {
      toast.error("Description is required");
      return;
    }
    try {
      await dispatch(createInvoiceItem({ invoiceId: invoice!.id, data: itemDraft })).unwrap();
      await dispatch(fetchInvoice(invoice!.id)); // refresh header totals
      setAddingLine(false);
      setItemDraft(EMPTY_LINE);
      toast.success("Line item added");
    } catch {
      toast.error("Failed to add line item");
    }
  }

  async function saveEditedLine(itemId: string) {
    try {
      await dispatch(updateInvoiceItem({ invoiceId: invoice!.id, itemId, data: itemDraft })).unwrap();
      await dispatch(fetchInvoice(invoice!.id));
      setEditingItemId(null);
      toast.success("Line item updated");
    } catch {
      toast.error("Failed to update line item");
    }
  }

  async function removeLine(itemId: string) {
    try {
      await dispatch(deleteInvoiceItem({ invoiceId: invoice!.id, itemId })).unwrap();
      await dispatch(fetchInvoice(invoice!.id));
      toast.success("Line item removed");
    } catch {
      toast.error("Failed to remove line item");
    }
  }

  return (
    <div>
      <PageHeader
        title={invoice.invoice_number}
        description={`${invoice.buyer_name} • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/${tenantSlug}/invoices`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            {isDraft && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />
      <div className="space-y-6 p-6">
        {/* Status + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_COLOR[invoice.status]}`}>
            {invoice.status.replace("_", " ").toLowerCase()}
          </span>
          <div className="flex gap-2">
            {invoice.status === "DRAFT" && (
              <Button size="sm" onClick={handleSend}>Send invoice</Button>
            )}
            {(invoice.status === "SENT" || invoice.status === "OVERDUE" || invoice.status === "PARTIALLY_PAID") && (
              <Button size="sm" onClick={handleMarkPaid}>Mark as paid</Button>
            )}
            {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
              <Button size="sm" variant="outline" onClick={handleCancel}>Cancel invoice</Button>
            )}
          </div>
        </div>

        {!isDraft && (
          <p className="text-xs text-muted-foreground">
            This invoice has been sent — buyer details and line items are locked. Only its status can change from here.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 py-4">
              <Field label="Buyer name">
                <Input
                  value={buyerDraft.buyer_name}
                  disabled={!isDraft || saving}
                  onChange={(e) => setBuyerDraft((d) => ({ ...d, buyer_name: e.target.value }))}
                  onBlur={saveBuyerDetails}
                />
              </Field>
              <Field label="Buyer GSTIN">
                <Input
                  value={buyerDraft.buyer_gstin}
                  disabled={!isDraft || saving}
                  onChange={(e) => setBuyerDraft((d) => ({ ...d, buyer_gstin: e.target.value }))}
                  onBlur={saveBuyerDetails}
                />
              </Field>
              <Field label="Buyer address">
                <Input
                  value={buyerDraft.buyer_address}
                  disabled={!isDraft || saving}
                  onChange={(e) => setBuyerDraft((d) => ({ ...d, buyer_address: e.target.value }))}
                  onBlur={saveBuyerDetails}
                />
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 py-4">
              <Field label="Issue date">
                <Input type="date" value={invoice.issue_date.slice(0, 10)} disabled />
              </Field>
              <Field label="Due date">
                <Input type="date" value={invoice.due_date.slice(0, 10)} disabled />
              </Field>
              <Field label="Currency">
                <Input value={invoice.currency} disabled />
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Line items</h3>
              {isDraft && !addingLine && (
                <Button size="sm" variant="outline" onClick={() => { setAddingLine(true); setItemDraft(EMPTY_LINE); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add line
                </Button>
              )}
            </div>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="w-20 px-3 py-2 font-medium">Qty</th>
                    <th className="w-28 px-3 py-2 font-medium">Unit price</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
                    {isDraft && <th className="w-20 px-3 py-2" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <tr key={item.id}>
                        {isEditing ? (
                          <>
                            <td className="px-3 py-2">
                              <Input value={itemDraft.description} onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))} />
                            </td>
                            <td className="px-3 py-2">
                              <Input type="number" value={itemDraft.quantity} onChange={(e) => setItemDraft((d) => ({ ...d, quantity: Number(e.target.value) }))} />
                            </td>
                            <td className="px-3 py-2">
                              <Input type="number" value={itemDraft.unit_price} onChange={(e) => setItemDraft((d) => ({ ...d, unit_price: Number(e.target.value) }))} />
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {fmt(Number(item.total_amount), invoice.currency)}
                            </td>
                            <td className="flex gap-1 px-3 py-2">
                              <Button size="icon" variant="ghost" onClick={() => saveEditedLine(item.id)}>
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingItemId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2">{item.quantity}</td>
                            <td className="px-3 py-2">{fmt(Number(item.unit_price), invoice.currency)}</td>
                            <td className="px-3 py-2 text-right font-medium">
                              {fmt(Number(item.total_amount), invoice.currency)}
                            </td>
                            {isDraft && (
                              <td className="flex gap-1 px-3 py-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setItemDraft({
                                      description: item.description,
                                      quantity: Number(item.quantity),
                                      unit_price: Number(item.unit_price),
                                      discount_amount: Number(item.discount_amount),
                                      cgst_rate: Number(item.cgst_rate),
                                      sgst_rate: Number(item.sgst_rate),
                                      igst_rate: Number(item.igst_rate),
                                    });
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => removeLine(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {addingLine && (
                    <tr>
                      <td className="px-3 py-2">
                        <Input autoFocus value={itemDraft.description} onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Description" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" value={itemDraft.quantity} onChange={(e) => setItemDraft((d) => ({ ...d, quantity: Number(e.target.value) }))} />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" value={itemDraft.unit_price} onChange={(e) => setItemDraft((d) => ({ ...d, unit_price: Number(e.target.value) }))} />
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                      <td className="flex gap-1 px-3 py-2">
                        <Button size="icon" variant="ghost" onClick={saveNewLine}>
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setAddingLine(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted/40">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td>
                    <td className="px-3 py-2 text-right text-base font-semibold">
                      {fmt(Number(invoice.total_amount), invoice.currency)}
                    </td>
                    {isDraft && <td />}
                  </tr>
                  {Number(invoice.amount_paid) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground">Amount due</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {fmt(Number(invoice.amount_due), invoice.currency)}
                      </td>
                      {isDraft && <td />}
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
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