import type { ChangeEvent, ReactNode } from "react";
import { Loader2 } from "lucide-react";
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
import type { CreateInvoiceLineItemInput } from "@/features/invoices/types/invoices.type";
import type { InvoiceItemFormErrors } from "@/features/invoices/validations/items.validate";

interface InvoiceLineItemDialogProps {
  open: boolean;
  mode: "create" | "edit";
  draft: CreateInvoiceLineItemInput;
  errors: InvoiceItemFormErrors;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (
    change: Partial<CreateInvoiceLineItemInput>,
    field: keyof CreateInvoiceLineItemInput,
  ) => void;
  onSubmit: () => void;
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function InvoiceLineItemDialog({
  open,
  mode,
  draft,
  errors,
  isSaving,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: InvoiceLineItemDialogProps) {
  const updateNumber = (
    field: "quantity" | "unit_price" | "discount_amount" | "cgst_rate" | "sgst_rate" | "igst_rate",
  ) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onDraftChange(
        { [field]: Number(event.target.value) } as Partial<CreateInvoiceLineItemInput>,
        field,
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add invoice item" : "Edit invoice item"}</DialogTitle>
          <DialogDescription>
            Enter the item description, price, quantity, and applicable tax details.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <FormField id="invoice-item-description" label="Item description" error={errors.description}>
            <Input
              id="invoice-item-description"
              autoFocus={mode === "create"}
              value={draft.description}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "invoice-item-description-error" : undefined}
              onChange={(event) => onDraftChange({ description: event.target.value }, "description")}
              placeholder="Enter item name or service description"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="invoice-item-quantity" label="Quantity" error={errors.quantity}>
              <Input
                id="invoice-item-quantity"
                type="number"
                min="0"
                step="any"
                value={draft.quantity}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={errors.quantity ? "invoice-item-quantity-error" : undefined}
                onChange={updateNumber("quantity")}
              />
            </FormField>
            <FormField id="invoice-item-unit-price" label="Unit price" error={errors.unit_price}>
              <Input
                id="invoice-item-unit-price"
                type="number"
                min="0"
                step="any"
                value={draft.unit_price}
                aria-invalid={Boolean(errors.unit_price)}
                aria-describedby={errors.unit_price ? "invoice-item-unit-price-error" : undefined}
                onChange={updateNumber("unit_price")}
              />
            </FormField>
            <FormField id="invoice-item-discount" label="Discount" error={errors.discount_amount}>
              <Input
                id="invoice-item-discount"
                type="number"
                min="0"
                step="any"
                value={draft.discount_amount}
                aria-invalid={Boolean(errors.discount_amount)}
                aria-describedby={errors.discount_amount ? "invoice-item-discount-error" : undefined}
                onChange={updateNumber("discount_amount")}
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tax rates</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField id="invoice-item-cgst" label="CGST (%)" error={errors.cgst_rate}>
                <Input
                  id="invoice-item-cgst"
                  type="number"
                  min="0"
                  step="any"
                  value={draft.cgst_rate}
                  aria-invalid={Boolean(errors.cgst_rate)}
                  aria-describedby={errors.cgst_rate ? "invoice-item-cgst-error" : undefined}
                  onChange={updateNumber("cgst_rate")}
                />
              </FormField>
              <FormField id="invoice-item-sgst" label="SGST (%)" error={errors.sgst_rate}>
                <Input
                  id="invoice-item-sgst"
                  type="number"
                  min="0"
                  step="any"
                  value={draft.sgst_rate}
                  aria-invalid={Boolean(errors.sgst_rate)}
                  aria-describedby={errors.sgst_rate ? "invoice-item-sgst-error" : undefined}
                  onChange={updateNumber("sgst_rate")}
                />
              </FormField>
              <FormField id="invoice-item-igst" label="IGST (%)" error={errors.igst_rate}>
                <Input
                  id="invoice-item-igst"
                  type="number"
                  min="0"
                  step="any"
                  value={draft.igst_rate}
                  aria-invalid={Boolean(errors.igst_rate)}
                  aria-describedby={errors.igst_rate ? "invoice-item-igst-error" : undefined}
                  onChange={updateNumber("igst_rate")}
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="invoice-item-hsn" label="HSN code">
              <Input
                id="invoice-item-hsn"
                value={draft.hsn_code ?? ""}
                onChange={(event) => onDraftChange({ hsn_code: event.target.value }, "hsn_code")}
                placeholder="Optional"
              />
            </FormField>
            <FormField id="invoice-item-sac" label="SAC code">
              <Input
                id="invoice-item-sac"
                value={draft.sac_code ?? ""}
                onChange={(event) => onDraftChange({ sac_code: event.target.value }, "sac_code")}
                placeholder="Optional"
              />
            </FormField>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving…" : mode === "create" ? "Add item" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
