import { memo, useCallback, useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InvoiceLineItemRow from "@/features/invoices/components/InvoiceLineItemRow";
import InvoiceTotals from "@/features/invoices/components/InvoiceTotals";
import type { CreateInvoiceLineItemInput, Invoice } from "@/features/invoices/types/invoices.type";
import type { InvoiceItem } from "@/features/invoices/types/items.types";

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

const EMPTY_ITEMS: InvoiceItem[] = [];

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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<CreateInvoiceLineItemInput>(EMPTY_LINE);
  const [addingLine, setAddingLine] = useState(false);
  const items = invoice.items ?? EMPTY_ITEMS;

  const startAddLine = useCallback(() => {
    setItemDraft({ ...EMPTY_LINE, description: invoice.project?.project_name ?? "" });
    setAddingLine(true);
  }, [invoice.project?.project_name]);

  const startEditItem = useCallback((item: InvoiceItem) => {
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
  }, []);

  const updateDraft = useCallback((change: Partial<CreateInvoiceLineItemInput>) => {
    setItemDraft((current) => ({ ...current, ...change }));
  }, []);

  const saveNewLine = useCallback(async () => {
    if (!itemDraft.description.trim()) {
      toast.error("Description is required");
      return;
    }
    const saved = await onCreateItem(itemDraft);
    if (saved) {
      setAddingLine(false);
      setItemDraft(EMPTY_LINE);
    }
  }, [itemDraft, onCreateItem]);

  const saveEditedLine = useCallback(
    async (itemId: string, draft: CreateInvoiceLineItemInput) => {
      const saved = await onUpdateItem(itemId, draft);
      if (saved) setEditingItemId(null);
    },
    [onUpdateItem],
  );

  const cancelEdit = useCallback(() => setEditingItemId(null), []);
  const cancelAddLine = useCallback(() => setAddingLine(false), []);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Line items</h3>
          {isDraft && !addingLine && (
            <Button size="sm" variant="outline" onClick={startAddLine}>
              <Plus className="mr-2 h-4 w-4" /> Add line
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-md border bg-card">
          <div className="overflow-x-auto scroller-hide rounded-md border">
            <table className="w-full border-collapse text-sm">
              <colgroup>
                <col className="w-55" />
                <col className="w-16" />
                <col className="w-27.5" />
                <col className="w-25" />
                <col className="w-19" />
                <col className="w-19" />
                <col className="w-19" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-32.5" />
                {isDraft && <col className="w-22" />}
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
                    <InvoiceLineItemRow
                      key={item.id}
                      item={item}
                      currency={invoice.currency}
                      isDraft={isDraft}
                      isEditing={isEditing}
                      draft={isEditing ? itemDraft : undefined}
                      onDraftChange={updateDraft}
                      onEdit={startEditItem}
                      onSave={saveEditedLine}
                      onCancelEdit={cancelEdit}
                      onRemove={onDeleteItem}
                    />
                  );
                })}
                {addingLine && (
                  <tr className="bg-muted/20">
                    <td className="p-1.5 align-middle">
                      <Input
                        autoFocus
                        className="h-8"
                        value={itemDraft.description}
                        onChange={(event) => updateDraft({ description: event.target.value })}
                        placeholder="Description"
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.quantity}
                        onChange={(event) => updateDraft({ quantity: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.unit_price}
                        onChange={(event) =>
                          updateDraft({ unit_price: Number(event.target.value) })
                        }
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.discount_amount}
                        onChange={(event) =>
                          updateDraft({ discount_amount: Number(event.target.value) })
                        }
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.cgst_rate}
                        onChange={(event) => updateDraft({ cgst_rate: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.sgst_rate}
                        onChange={(event) => updateDraft({ sgst_rate: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8 text-right"
                        type="number"
                        value={itemDraft.igst_rate}
                        onChange={(event) => updateDraft({ igst_rate: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8"
                        value={itemDraft.hsn_code ?? ""}
                        onChange={(event) => updateDraft({ hsn_code: event.target.value })}
                        placeholder="HSN"
                      />
                    </td>
                    <td className="p-1.5 align-middle">
                      <Input
                        className="h-8"
                        value={itemDraft.sac_code ?? ""}
                        onChange={(event) => updateDraft({ sac_code: event.target.value })}
                        placeholder="SAC"
                      />
                    </td>
                    <td className="px-3 py-2 text-right align-middle text-muted-foreground">—</td>
                    <td className="px-2 py-2 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={saveNewLine}
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={cancelAddLine}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <InvoiceTotals invoice={invoice} isDraft={isDraft} />
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(InvoiceLineItems);
