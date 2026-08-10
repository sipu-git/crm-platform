import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchInvoice, updateInvoice, deleteInvoice, markInvoicePaid, selectInvoiceDetail, selectInvoicesLoading } from "@/features/invoices/service2/slice";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  hsn_code: "",
  sac_code: "",
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
  const [sellerDraft, setSellerDraft] = useState({
    seller_name: "", seller_gstin: "", seller_address: "", seller_state: "",
  });
  const [metaDraft, setMetaDraft] = useState({ notes: "", terms: "" });

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
      setSellerDraft({
        seller_name: invoice.seller_name,
        seller_gstin: invoice.seller_gstin ?? "",
        seller_address: invoice.seller_address ?? "",
        seller_state: invoice.seller_state ?? "",
      });
      setMetaDraft({
        notes: invoice.notes ?? "",
        terms: invoice.terms ?? "",
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

  async function saveSellerDetails() {
    setSaving(true);
    try {
      await dispatch(updateInvoice({ id: invoice!.id, changes: sellerDraft })).unwrap();
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveMeta() {
    setSaving(true);
    try {
      await dispatch(updateInvoice({ id: invoice!.id, changes: metaDraft })).unwrap();
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

  function startEditItem(item: (typeof items)[number]) {
    setEditingItemId(item.id);
    setItemDraft({
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount_amount: Number(item.discount_amount),
      cgst_rate: Number(item.cgst_rate),
      sgst_rate: Number(item.sgst_rate),
      igst_rate: Number(item.igst_rate),
      hsn_code: item.hsn_code ?? "",
      sac_code: item.sac_code ?? "",
    });
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
            This invoice has been sent — buyer/seller details and line items are locked. Only its status can change from here.
          </p>
        )}

        {/* Seller / Buyer */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Seller details</CardTitle></CardHeader>
            <CardContent className="space-y-3 py-2">
              <Field label="Seller name">
                <Input
                  value={sellerDraft.seller_name}
                  disabled={!isDraft || saving}
                  onChange={(e) => setSellerDraft((d) => ({ ...d, seller_name: e.target.value }))}
                  onBlur={saveSellerDetails}
                />
              </Field>
              <Field label="Seller GSTIN">
                <Input
                  value={sellerDraft.seller_gstin}
                  disabled={!isDraft || saving}
                  onChange={(e) => setSellerDraft((d) => ({ ...d, seller_gstin: e.target.value }))}
                  onBlur={saveSellerDetails}
                  placeholder="—"
                />
              </Field>
              <Field label="Seller address">
                <Input
                  value={sellerDraft.seller_address}
                  disabled={!isDraft || saving}
                  onChange={(e) => setSellerDraft((d) => ({ ...d, seller_address: e.target.value }))}
                  onBlur={saveSellerDetails}
                  placeholder="—"
                />
              </Field>
              <Field label="Seller state">
                <Input
                  value={sellerDraft.seller_state}
                  disabled={!isDraft || saving}
                  onChange={(e) => setSellerDraft((d) => ({ ...d, seller_state: e.target.value }))}
                  onBlur={saveSellerDetails}
                  placeholder="—"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Buyer details</CardTitle></CardHeader>
            <CardContent className="space-y-3 py-2">
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
                  placeholder="—"
                />
              </Field>
              <Field label="Buyer address">
                <Input
                  value={buyerDraft.buyer_address}
                  disabled={!isDraft || saving}
                  onChange={(e) => setBuyerDraft((d) => ({ ...d, buyer_address: e.target.value }))}
                  onBlur={saveBuyerDetails}
                  placeholder="—"
                />
              </Field>
              <Field label="Buyer state">
                <Input
                  value={buyerDraft.buyer_state}
                  disabled={!isDraft || saving}
                  onChange={(e) => setBuyerDraft((d) => ({ ...d, buyer_state: e.target.value }))}
                  onBlur={saveBuyerDetails}
                  placeholder="—"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Invoice meta */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 py-4 md:grid-cols-3">
            <Field label="Issue date">
              <Input type="date" value={invoice.issue_date.slice(0, 10)} disabled />
            </Field>
            <Field label="Due date">
              <Input type="date" value={invoice.due_date.slice(0, 10)} disabled />
            </Field>
            <Field label="Currency">
              <Input value={invoice.currency} disabled />
            </Field>
            {invoice.paid_at && (
              <Field label="Paid at">
                <Input value={new Date(invoice.paid_at).toLocaleString()} disabled />
              </Field>
            )}
            <Field label="Invoice type">
              <Input value={invoice.invoice_type} disabled />
            </Field>
          </CardContent>
        </Card>

        {/* Line items */}
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
            <div className="overflow-hidden rounded-md border bg-card">
              <div className="overflow-x-auto scroller-hide rounded-md border">
              <table className="w-full border-collapse text-sm">
                <colgroup>
                  <col className="w-55" /> {/* description */}
                  <col className="w-16" />  {/* qty */}
                  <col className="w-27.5" /> {/* unit price */}
                  <col className="w-25" /> {/* discount */}
                  <col className="w-19" />  {/* cgst % */}
                  <col className="w-19" />  {/* cgst % */}
                  <col className="w-19" />  {/* cgst % */}
                  <col className="w-24" />  {/* hsn */}
                  <col className="w-24" />  {/* hsn */}
                  <col className="w-32.5" /> {/* amount */}
                  {isDraft && <col className="w-22" />} {/* actions */}
                </colgroup>
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b">
                    <th className="truncate px-3 py-2.5 font-medium">Description</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">Qty</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">Unit price</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">Discount</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">CGST %</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">SGST %</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">IGST %</th>
                    <th className="truncate px-3 py-2.5 font-medium">HSN</th>
                    <th className="truncate px-3 py-2.5 font-medium">SAC</th>
                    <th className="truncate px-3 py-2.5 text-right font-medium">Amount</th>
                    {isDraft && <th className="px-3 py-2.5" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length === 0 && !addingLine && (
                    <tr>
                      <td
                        colSpan={isDraft ? 11 : 10}
                        className="px-3 py-6 text-center text-muted-foreground"
                      >
                        No line items yet.
                      </td>
                    </tr>
                  )}
                  {items.map((item) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <tr key={item.id} className={isEditing ? "bg-muted/20" : undefined}>
                        {isEditing ? (
                          <>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8"
                                value={itemDraft.description}
                                onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.quantity}
                                onChange={(e) => setItemDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.unit_price}
                                onChange={(e) => setItemDraft((d) => ({ ...d, unit_price: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.discount_amount}
                                onChange={(e) => setItemDraft((d) => ({ ...d, discount_amount: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.cgst_rate}
                                onChange={(e) => setItemDraft((d) => ({ ...d, cgst_rate: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.sgst_rate}
                                onChange={(e) => setItemDraft((d) => ({ ...d, sgst_rate: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8 text-right"
                                type="number"
                                value={itemDraft.igst_rate}
                                onChange={(e) => setItemDraft((d) => ({ ...d, igst_rate: Number(e.target.value) }))}
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8"
                                value={itemDraft.hsn_code ?? ""}
                                onChange={(e) => setItemDraft((d) => ({ ...d, hsn_code: e.target.value }))}
                                placeholder="HSN"
                              />
                            </td>
                            <td className="p-1.5 align-middle">
                              <Input
                                className="h-8"
                                value={itemDraft.sac_code ?? ""}
                                onChange={(e) => setItemDraft((d) => ({ ...d, sac_code: e.target.value }))}
                                placeholder="SAC"
                              />
                            </td>
                            <td className="px-3 py-2 text-right align-middle font-medium tabular-nums">
                              {fmt(Number(item.total_amount), invoice.currency)}
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEditedLine(item.id)}>
                                  <Check className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItemId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="truncate px-3 py-2.5 align-middle" title={item.description}>
                              {item.description}
                            </td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">{Number(item.quantity)}</td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">
                              {fmt(Number(item.unit_price), invoice.currency)}
                            </td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">
                              {fmt(Number(item.discount_amount), invoice.currency)}
                            </td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">{Number(item.cgst_rate)}%</td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">{Number(item.sgst_rate)}%</td>
                            <td className="px-3 py-2.5 text-right align-middle tabular-nums">{Number(item.igst_rate)}%</td>
                            <td className="truncate px-3 py-2.5 align-middle text-muted-foreground">
                              {item.hsn_code ?? "—"}
                            </td>
                            <td className="truncate px-3 py-2.5 align-middle text-muted-foreground">
                              {item.sac_code ?? "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right align-middle font-medium tabular-nums">
                              {fmt(Number(item.total_amount), invoice.currency)}
                            </td>
                            {isDraft && (
                              <td className="px-2 py-2.5 align-middle">
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditItem(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeLine(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {addingLine && (
                    <tr className="bg-muted/20">
                      <td className="p-1.5 align-middle">
                        <Input
                          autoFocus
                          className="h-8"
                          value={itemDraft.description}
                          onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))}
                          placeholder="Description"
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.quantity}
                          onChange={(e) => setItemDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.unit_price}
                          onChange={(e) => setItemDraft((d) => ({ ...d, unit_price: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.discount_amount}
                          onChange={(e) => setItemDraft((d) => ({ ...d, discount_amount: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.cgst_rate}
                          onChange={(e) => setItemDraft((d) => ({ ...d, cgst_rate: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.sgst_rate}
                          onChange={(e) => setItemDraft((d) => ({ ...d, sgst_rate: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8 text-right"
                          type="number"
                          value={itemDraft.igst_rate}
                          onChange={(e) => setItemDraft((d) => ({ ...d, igst_rate: Number(e.target.value) }))}
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8"
                          value={itemDraft.hsn_code ?? ""}
                          onChange={(e) => setItemDraft((d) => ({ ...d, hsn_code: e.target.value }))}
                          placeholder="HSN"
                        />
                      </td>
                      <td className="p-1.5 align-middle">
                        <Input
                          className="h-8"
                          value={itemDraft.sac_code ?? ""}
                          onChange={(e) => setItemDraft((d) => ({ ...d, sac_code: e.target.value }))}
                          placeholder="SAC"
                        />
                      </td>
                      <td className="px-3 py-2 text-right align-middle text-muted-foreground">—</td>
                      <td className="px-2 py-2 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveNewLine}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddingLine(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t bg-muted/40">
                  <tr>
                    <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">Subtotal</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(invoice.subtotal), invoice.currency)}</td>
                    {isDraft && <td />}
                  </tr>
                  {Number(invoice.discount_amount) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">Discount</td>
                      <td className="px-3 py-2 text-right tabular-nums">−{fmt(Number(invoice.discount_amount), invoice.currency)}</td>
                      {isDraft && <td />}
                    </tr>
                  )}
                  <tr>
                    <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">Taxable amount</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(invoice.taxable_amount), invoice.currency)}</td>
                    {isDraft && <td />}
                  </tr>
                  {Number(invoice.cgst_amount) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">CGST</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(invoice.cgst_amount), invoice.currency)}</td>
                      {isDraft && <td />}
                    </tr>
                  )}
                  {Number(invoice.sgst_amount) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">SGST</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(invoice.sgst_amount), invoice.currency)}</td>
                      {isDraft && <td />}
                    </tr>
                  )}
                  {Number(invoice.igst_amount) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">IGST</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(invoice.igst_amount), invoice.currency)}</td>
                      {isDraft && <td />}
                    </tr>
                  )}
                  <tr className="border-t">
                    <td colSpan={9} className="px-3 py-2.5 text-right font-medium">Total</td>
                    <td className="px-3 py-2.5 text-right text-base font-semibold tabular-nums">
                      {fmt(Number(invoice.total_amount), invoice.currency)}
                    </td>
                    {isDraft && <td />}
                  </tr>
                  {Number(invoice.amount_paid) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">Amount paid</td>
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                        {fmt(Number(invoice.amount_paid), invoice.currency)}
                      </td>
                      {isDraft && <td />}
                    </tr>
                  )}
                  {Number(invoice.amount_due) > 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-2 text-right text-muted-foreground">Amount due</td>
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                        {fmt(Number(invoice.amount_due), invoice.currency)}
                      </td>
                      {isDraft && <td />}
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
            </div>
            
          </CardContent>
        </Card>

        {/* Notes & terms */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Notes &amp; terms</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
            <Field label="Notes">
              <Textarea
                value={metaDraft.notes}
                disabled={!isDraft || saving}
                onChange={(e) => setMetaDraft((d) => ({ ...d, notes: e.target.value }))}
                onBlur={saveMeta}
                placeholder="—"
                rows={3}
              />
            </Field>
            <Field label="Terms">
              <Textarea
                value={metaDraft.terms}
                disabled={!isDraft || saving}
                onChange={(e) => setMetaDraft((d) => ({ ...d, terms: e.target.value }))}
                onBlur={saveMeta}
                placeholder="—"
                rows={3}
              />
            </Field>
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