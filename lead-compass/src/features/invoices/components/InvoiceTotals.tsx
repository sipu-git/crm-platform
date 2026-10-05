import { memo, useMemo } from "react";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import { formatInvoiceAmount } from "@/features/invoices/components/invoice-detail.utils";

interface InvoiceTotalsProps {
  invoice: Invoice;
  isDraft: boolean;
}

function InvoiceTotals({ invoice, isDraft }: InvoiceTotalsProps) {
  const rows = useMemo(() => {
    const rows = [
      { key: "subtotal", label: "Subtotal", amount: formatInvoiceAmount(Number(invoice.subtotal)) },
    ];

    if (Number(invoice.discount_amount) > 0) {
      rows.push({
        key: "discount",
        label: "Discount",
        amount: `−${formatInvoiceAmount(Number(invoice.discount_amount))}`,
      });
    }

    rows.push({
      key: "taxable",
      label: "Taxable amount",
      amount: formatInvoiceAmount(Number(invoice.taxable_amount)),
    });

    if (Number(invoice.cgst_amount) > 0) {
      rows.push({
        key: "cgst",
        label: "CGST",
        amount: formatInvoiceAmount(Number(invoice.cgst_amount)),
      });
    }
    if (Number(invoice.sgst_amount) > 0) {
      rows.push({
        key: "sgst",
        label: "SGST",
        amount: formatInvoiceAmount(Number(invoice.sgst_amount)),
      });
    }
    if (Number(invoice.igst_amount) > 0) {
      rows.push({
        key: "igst",
        label: "IGST",
        amount: formatInvoiceAmount(Number(invoice.igst_amount)),
      });
    }

    rows.push({
      key: "total",
      label: "Total",
      amount: formatInvoiceAmount(Number(invoice.total_amount)),
    });

    if (Number(invoice.amount_paid) > 0) {
      rows.push({
        key: "paid",
        label: "Amount paid",
        amount: formatInvoiceAmount(Number(invoice.amount_paid)),
      });
    }
    if (Number(invoice.amount_due) > 0) {
      rows.push({
        key: "due",
        label: "Amount due",
        amount: formatInvoiceAmount(Number(invoice.amount_due)),
      });
    }

    return rows;
  }, [invoice]);

  return (
    <tfoot className="border-t bg-muted/40">
      {rows.map((row) => {
        const isTotal = row.key === "total";
        const isMuted = row.key === "paid" || row.key === "due";
        return (
          <tr key={row.key} className={isTotal ? "border-t" : undefined}>
            <td
              colSpan={9}
              className={`px-3 text-right ${isTotal ? "py-2.5 font-medium" : "py-2 text-muted-foreground"}`}
            >
              {row.label}
            </td>
            <td
              className={`px-3 text-right tabular-nums ${isTotal ? "py-2.5 text-base font-semibold" : "py-2"} ${isMuted ? "text-muted-foreground" : ""}`}
            >
              {row.amount}
            </td>
            {isDraft && <td />}
          </tr>
        );
      })}
    </tfoot>
  );
}

export default memo(InvoiceTotals);
