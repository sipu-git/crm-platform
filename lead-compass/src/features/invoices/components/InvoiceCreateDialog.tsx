import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceMutation } from "@/features/invoices/hooks/useInvoices";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceType,
} from "@/features/invoices/types/invoices.type";

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function newInvoiceDraft() {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  return {
    invoice_type: "TAX_INVOICE" as InvoiceType,
    issue_date: dateInputValue(today),
    due_date: dateInputValue(due),
    currency: "INR",
    seller_name: "",
    seller_gstin: "",
    seller_address: "",
    seller_state: "",
    buyer_name: "",
    buyer_gstin: "",
    buyer_address: "",
    buyer_state: "",
    description: "",
    quantity: "1",
    unit_price: "",
    cgst_rate: "0",
    sgst_rate: "0",
    igst_rate: "0",
    notes: "",
  };
}

export function InvoiceCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (invoice: Invoice) => void;
}) {
  const { create } = useInvoiceMutation();
  const [draft, setDraft] = useState(newInvoiceDraft);
  const [error, setError] = useState("");

  const update = (field: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(draft.quantity);
    const unitPrice = Number(draft.unit_price);
    if (
      !draft.seller_name.trim() ||
      !draft.buyer_name.trim() ||
      !draft.description.trim() ||
      !draft.issue_date ||
      !draft.due_date ||
      quantity <= 0 ||
      unitPrice <= 0
    ) {
      setError(
        "Add seller and buyer names, an item, valid dates, and a price to create the invoice.",
      );
      return;
    }
    const taxRates = [draft.cgst_rate, draft.sgst_rate, draft.igst_rate].map(Number);
    if (taxRates.some((rate) => !Number.isFinite(rate) || rate < 0 || rate > 100)) {
      setError("Tax rates must be between 0 and 100%.");
      return;
    }
    if (new Date(draft.due_date) < new Date(draft.issue_date)) {
      setError("The due date must be on or after the issue date.");
      return;
    }

    const payload: CreateInvoiceInput = {
      invoice_type: draft.invoice_type,
      issue_date: new Date(`${draft.issue_date}T00:00:00`).toISOString(),
      due_date: new Date(`${draft.due_date}T00:00:00`).toISOString(),
      currency: draft.currency.trim().toUpperCase() || "INR",
      seller_name: draft.seller_name.trim(),
      seller_gstin: draft.seller_gstin.trim() || undefined,
      seller_address: draft.seller_address.trim() || undefined,
      seller_state: draft.seller_state.trim() || undefined,
      buyer_name: draft.buyer_name.trim(),
      buyer_gstin: draft.buyer_gstin.trim() || undefined,
      buyer_address: draft.buyer_address.trim() || undefined,
      buyer_state: draft.buyer_state.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      items: [
        {
          description: draft.description.trim(),
          quantity,
          unit_price: unitPrice,
          discount_amount: 0,
          cgst_rate: Number(draft.cgst_rate) || 0,
          sgst_rate: Number(draft.sgst_rate) || 0,
          igst_rate: Number(draft.igst_rate) || 0,
        },
      ],
    };

    try {
      const invoice = await create.mutateAsync(payload);
      toast.success("Invoice created");
      onCreated?.(invoice);
      onOpenChange(false);
      setDraft(newInvoiceDraft());
      setError("");
    } catch {
      setError("Could not create the invoice. Check the details and try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Create a draft invoice with one line item. You can add more items after saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Invoice type</Label>
              <Select
                value={draft.invoice_type}
                onValueChange={(value) => update("invoice_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAX_INVOICE">Tax invoice</SelectItem>
                  <SelectItem value="PROFORMA">Proforma</SelectItem>
                  <SelectItem value="CREDIT_NOTE">Credit note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-issue-date">Issue date</Label>
              <Input
                id="invoice-issue-date"
                type="date"
                value={draft.issue_date}
                onChange={(e) => update("issue_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-due-date">Due date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={draft.due_date}
                onChange={(e) => update("due_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-3 rounded-xl border p-3.5">
              <legend className="px-1 text-sm font-semibold">From</legend>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-seller">Seller name</Label>
                <Input
                  id="invoice-seller"
                  value={draft.seller_name}
                  onChange={(e) => update("seller_name", e.target.value)}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-seller-gstin">
                  GSTIN <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invoice-seller-gstin"
                  value={draft.seller_gstin}
                  onChange={(e) => update("seller_gstin", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-seller-address">
                  Address <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="invoice-seller-address"
                  rows={2}
                  value={draft.seller_address}
                  onChange={(e) => update("seller_address", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-seller-state">
                  State <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invoice-seller-state"
                  value={draft.seller_state}
                  onChange={(e) => update("seller_state", e.target.value)}
                />
              </div>
            </fieldset>
            <fieldset className="space-y-3 rounded-xl border p-3.5">
              <legend className="px-1 text-sm font-semibold">Bill to</legend>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-buyer">Buyer name</Label>
                <Input
                  id="invoice-buyer"
                  value={draft.buyer_name}
                  onChange={(e) => update("buyer_name", e.target.value)}
                  placeholder="Customer or company"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-buyer-gstin">
                  GSTIN <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invoice-buyer-gstin"
                  value={draft.buyer_gstin}
                  onChange={(e) => update("buyer_gstin", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-buyer-address">
                  Address <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="invoice-buyer-address"
                  rows={2}
                  value={draft.buyer_address}
                  onChange={(e) => update("buyer_address", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-buyer-state">
                  State <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invoice-buyer-state"
                  value={draft.buyer_state}
                  onChange={(e) => update("buyer_state", e.target.value)}
                />
              </div>
            </fieldset>
          </div>

          <fieldset className="space-y-3 rounded-xl border p-3.5">
            <legend className="px-1 text-sm font-semibold">First line item</legend>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_160px]">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-item-description">Description</Label>
                <Input
                  id="invoice-item-description"
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Product or service"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-item-quantity">Quantity</Label>
                <Input
                  id="invoice-item-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={draft.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-item-price">Unit price</Label>
                <Input
                  id="invoice-item-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.unit_price}
                  onChange={(e) => update("unit_price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-currency">Currency</Label>
                <Input
                  id="invoice-currency"
                  maxLength={3}
                  value={draft.currency}
                  onChange={(e) => update("currency", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-notes">
                  Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invoice-notes"
                  value={draft.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Payment instructions or a note"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-cgst">CGST rate (%)</Label>
                <Input
                  id="invoice-cgst"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={draft.cgst_rate}
                  onChange={(e) => update("cgst_rate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-sgst">SGST rate (%)</Label>
                <Input
                  id="invoice-sgst"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={draft.sgst_rate}
                  onChange={(e) => update("sgst_rate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-igst">IGST rate (%)</Label>
                <Input
                  id="invoice-igst"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={draft.igst_rate}
                  onChange={(e) => update("igst_rate", e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
