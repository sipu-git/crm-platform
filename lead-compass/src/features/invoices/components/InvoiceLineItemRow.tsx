import { memo } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateInvoiceLineItemInput } from "@/features/invoices/types/invoices.type";
import type { InvoiceItem } from "@/features/invoices/types/items.types";
import { formatInvoiceAmount } from "@/features/invoices/components/invoice-detail.utils";

interface InvoiceLineItemRowProps {
  item: InvoiceItem;
  currency: string;
  isDraft: boolean;
  isEditing: boolean;
  draft?: CreateInvoiceLineItemInput;
  onDraftChange: (change: Partial<CreateInvoiceLineItemInput>) => void;
  onEdit: (item: InvoiceItem) => void;
  onSave: (itemId: string, draft: CreateInvoiceLineItemInput) => void;
  onCancelEdit: () => void;
  onRemove: (itemId: string) => void;
}

function InvoiceLineItemRow({
  item,
  currency,
  isDraft,
  isEditing,
  draft,
  onDraftChange,
  onEdit,
  onSave,
  onCancelEdit,
  onRemove,
}: InvoiceLineItemRowProps) {
  return (
    <tr className={isEditing ? "bg-muted/20" : undefined}>
      {isEditing ? (
        <>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8"
              value={draft!.description}
              onChange={(event) => onDraftChange({ description: event.target.value })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.quantity}
              onChange={(event) => onDraftChange({ quantity: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.unit_price}
              onChange={(event) => onDraftChange({ unit_price: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.discount_amount}
              onChange={(event) => onDraftChange({ discount_amount: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.cgst_rate}
              onChange={(event) => onDraftChange({ cgst_rate: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.sgst_rate}
              onChange={(event) => onDraftChange({ sgst_rate: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8 text-right"
              type="number"
              value={draft!.igst_rate}
              onChange={(event) => onDraftChange({ igst_rate: Number(event.target.value) })}
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8"
              value={draft!.hsn_code ?? ""}
              onChange={(event) => onDraftChange({ hsn_code: event.target.value })}
              placeholder="HSN"
            />
          </td>
          <td className="p-1.5 align-middle">
            <Input
              className="h-8"
              value={draft!.sac_code ?? ""}
              onChange={(event) => onDraftChange({ sac_code: event.target.value })}
              placeholder="SAC"
            />
          </td>
          <td className="px-3 py-2 text-right align-middle font-medium tabular-nums">
            {formatInvoiceAmount(Number(item.total_amount), currency)}
          </td>
          <td className="px-2 py-2 align-middle">
            <div className="flex items-center justify-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onSave(item.id, draft!)}
              >
                <Check className="h-4 w-4 text-emerald-600" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCancelEdit}>
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
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {Number(item.quantity)}
          </td>
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {formatInvoiceAmount(Number(item.unit_price), currency)}
          </td>
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {formatInvoiceAmount(Number(item.discount_amount), currency)}
          </td>
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {Number(item.cgst_rate)}%
          </td>
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {Number(item.sgst_rate)}%
          </td>
          <td className="px-3 py-2.5 text-right align-middle tabular-nums">
            {Number(item.igst_rate)}%
          </td>
          <td className="truncate px-3 py-2.5 align-middle text-muted-foreground">
            {item.hsn_code ?? "—"}
          </td>
          <td className="truncate px-3 py-2.5 align-middle text-muted-foreground">
            {item.sac_code ?? "—"}
          </td>
          <td className="px-3 py-2.5 text-right align-middle font-medium tabular-nums">
            {formatInvoiceAmount(Number(item.total_amount), currency)}
          </td>
          {isDraft && (
            <td className="px-2 py-2.5 align-middle">
              <div className="flex items-center justify-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          )}
        </>
      )}
    </tr>
  );
}

export default memo(InvoiceLineItemRow);
