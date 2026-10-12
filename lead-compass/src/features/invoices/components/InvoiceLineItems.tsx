import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceTotals from "@/features/invoices/components/InvoiceTotals";
import { formatInvoiceAmount } from "@/features/invoices/components/invoice-detail.utils";
import {
  INVOICE_ITEM_FORM_DEFAULTS,
  validateInvoiceItemForm,
  type InvoiceItemFormErrors,
} from "@/features/invoices/validations/items.validate";
import type { CreateInvoiceLineItemInput, Invoice } from "@/features/invoices/types/invoices.type";
import type { InvoiceItem } from "@/features/invoices/types/items.types";

const EMPTY_ITEMS: InvoiceItem[] = [];
const InvoiceLineItemDialog = lazy(
  () => import("@/features/invoices/components/InvoiceLineItemDialog"),
);

interface InvoiceLineItemsProps {
  invoice: Invoice;
  isDraft: boolean;
  onCreateItem: (draft: CreateInvoiceLineItemInput) => Promise<boolean>;
  onUpdateItem: (itemId: string, draft: CreateInvoiceLineItemInput) => Promise<boolean>;
  onDeleteItem: (itemId: string) => void;
}

function InvoiceLineItems({
  invoice,
  isDraft,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: InvoiceLineItemsProps) {
  const [activeItem, setActiveItem] = useState<InvoiceItem | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemDraft, setItemDraft] = useState<CreateInvoiceLineItemInput>(INVOICE_ITEM_FORM_DEFAULTS);
  const [formErrors, setFormErrors] = useState<InvoiceItemFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const items = invoice.items ?? EMPTY_ITEMS;

  const openAddDialog = useCallback(() => {
    setActiveItem(null);
    setItemDraft({ ...INVOICE_ITEM_FORM_DEFAULTS });
    setFormErrors({});
    setItemDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: InvoiceItem) => {
    setActiveItem(item);
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
    setFormErrors({});
    setItemDialogOpen(true);
  }, []);

  const updateDraft = useCallback(
    (change: Partial<CreateInvoiceLineItemInput>, field: keyof CreateInvoiceLineItemInput) => {
      setItemDraft((current) => ({ ...current, ...change }));
      setFormErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!isSaving) setItemDialogOpen(open);
  }, [isSaving]);

  const saveItem = useCallback(async () => {
    const errors = validateInvoiceItemForm(itemDraft);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const value: CreateInvoiceLineItemInput = {
      ...itemDraft,
      description: itemDraft.description.trim(),
      hsn_code: itemDraft.hsn_code?.trim() ?? "",
      sac_code: itemDraft.sac_code?.trim() ?? "",
    };

    setIsSaving(true);
    try {
      const saved = activeItem
        ? await onUpdateItem(activeItem.id, value)
        : await onCreateItem(value);

      if (saved) {
        setItemDialogOpen(false);
        setActiveItem(null);
        setItemDraft({ ...INVOICE_ITEM_FORM_DEFAULTS });
      }
    } finally {
      setIsSaving(false);
    }
  }, [activeItem, itemDraft, onCreateItem, onUpdateItem]);

  const detailRows = useMemo(() => [
      { key: "quantity", label: "Quantity", value: (item: InvoiceItem) => Number(item.quantity).toLocaleString() },
      { key: "unit-price", label: "Unit price", value: (item: InvoiceItem) => formatInvoiceAmount(Number(item.unit_price), invoice.currency) },
      { key: "discount", label: "Discount", value: (item: InvoiceItem) => formatInvoiceAmount(Number(item.discount_amount), invoice.currency) },
      { key: "taxable", label: "Taxable amount", value: (item: InvoiceItem) => formatInvoiceAmount(Number(item.taxable_amount), invoice.currency) },
      { key: "cgst-rate", label: "CGST rate", value: (item: InvoiceItem) => `${Number(item.cgst_rate)}%` },
      { key: "cgst-amount", label: "CGST amount", value: (item: InvoiceItem) => Number(item.cgst_amount) > 0 ? formatInvoiceAmount(Number(item.cgst_amount), invoice.currency) : "—" },
      { key: "sgst-rate", label: "SGST rate", value: (item: InvoiceItem) => `${Number(item.sgst_rate)}%` },
      { key: "sgst-amount", label: "SGST amount", value: (item: InvoiceItem) => Number(item.sgst_amount) > 0 ? formatInvoiceAmount(Number(item.sgst_amount), invoice.currency) : "—" },
      { key: "igst-rate", label: "IGST rate", value: (item: InvoiceItem) => `${Number(item.igst_rate)}%` },
      { key: "igst-amount", label: "IGST amount", value: (item: InvoiceItem) => Number(item.igst_amount) > 0 ? formatInvoiceAmount(Number(item.igst_amount), invoice.currency) : "—" },
      { key: "hsn", label: "HSN code", value: (item: InvoiceItem) => item.hsn_code || "—" },
      { key: "sac", label: "SAC code", value: (item: InvoiceItem) => item.sac_code || "—" },
      { key: "total", label: "Line total", value: (item: InvoiceItem) => formatInvoiceAmount(Number(item.total_amount), invoice.currency) },
    ],[invoice.currency]);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Invoice item details</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Item descriptions are columns; quantities, tax, and pricing are rows.
              </p>
            </div>
            {isDraft && (
              <Button size="sm" variant="outline" onClick={openAddDialog}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center">
              <p className="text-sm font-medium">No invoice items yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isDraft ? "Add an item to build this invoice." : "This invoice has no item details."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-max min-w-full border-collapse text-sm" aria-label="Invoice item details">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="sticky left-0 z-20 min-w-36 bg-muted/80 px-3 py-3 font-medium">
                      Item
                    </th>
                    {items.map((item, index) => (
                      <th key={item.id} scope="col" className="min-w-48 max-w-64 px-3 py-3 align-top font-medium normal-case tracking-normal text-foreground">
                        <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
                          Item {index + 1}
                        </span>
                        <span className="block whitespace-normal break-words text-sm">{item.description}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detailRows.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-card px-3 py-2.5 text-left font-medium text-muted-foreground">
                        {row.label}
                      </th>
                      {items.map((item) => (
                        <td key={item.id} className={`px-3 py-2.5 tabular-nums ${row.key === "total" ? "font-semibold text-foreground" : "text-foreground"}`}>
                          {row.value(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {isDraft && (
                    <tr className="border-t bg-muted/20">
                      <th scope="row" className="sticky left-0 z-10 bg-muted/40 px-3 py-2.5 text-left font-medium text-muted-foreground">
                        Actions
                      </th>
                      {items.map((item) => (
                        <td key={item.id} className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Edit ${item.description}`}
                              title="Edit item"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Remove ${item.description}`}
                              title="Remove item"
                              onClick={() => onDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <InvoiceTotals invoice={invoice} />
        </CardContent>
      </Card>

      {itemDialogOpen && (
        <Suspense fallback={null}>
          <InvoiceLineItemDialog
            open={itemDialogOpen}
            mode={activeItem ? "edit" : "create"}
            draft={itemDraft}
            errors={formErrors}
            isSaving={isSaving}
            onOpenChange={handleOpenChange}
            onDraftChange={updateDraft}
            onSubmit={saveItem}
          />
        </Suspense>
      )}
    </>
  );
}

export default memo(InvoiceLineItems);
