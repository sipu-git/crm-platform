import { memo, useMemo } from "react";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import { formatInvoiceAmount } from "@/features/invoices/components/invoice-detail.utils";

function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  const rows = useMemo(() => {
    const totals = [
      { key: "subtotal", label: "Subtotal", amount: formatInvoiceAmount(Number(invoice.subtotal), invoice.currency) },
    ];

    if (Number(invoice.discount_amount) > 0) {
      totals.push({
        key: "discount",
        label: "Discount",
        amount: `-${formatInvoiceAmount(Number(invoice.discount_amount), invoice.currency)}`,
      });
    }

    totals.push({
      key: "taxable",
      label: "Taxable amount",
      amount: formatInvoiceAmount(Number(invoice.taxable_amount), invoice.currency),
    });

    if (Number(invoice.cgst_amount) > 0) {
      totals.push({
        key: "cgst",
        label: "CGST",
        amount: formatInvoiceAmount(Number(invoice.cgst_amount), invoice.currency),
      });
    }
    if (Number(invoice.sgst_amount) > 0) {
      totals.push({
        key: "sgst",
        label: "SGST",
        amount: formatInvoiceAmount(Number(invoice.sgst_amount), invoice.currency),
      });
    }
    if (Number(invoice.igst_amount) > 0) {
      totals.push({
        key: "igst",
        label: "IGST",
        amount: formatInvoiceAmount(Number(invoice.igst_amount), invoice.currency),
      });
    }

    totals.push({
      key: "total",
      label: "Total",
      amount: formatInvoiceAmount(Number(invoice.total_amount), invoice.currency),
    });

    if (Number(invoice.amount_paid) > 0) {
      totals.push({
        key: "paid",
        label: "Amount paid",
        amount: formatInvoiceAmount(Number(invoice.amount_paid), invoice.currency),
      });
    }
    if (Number(invoice.amount_due) > 0) {
      totals.push({
        key: "due",
        label: "Amount due",
        amount: formatInvoiceAmount(Number(invoice.amount_due), invoice.currency),
      });
    }

    return totals;
  }, [invoice]);

  return (
    <dl className="ml-auto w-full max-w-sm space-y-2 border-t pt-4">
      {rows.map((row) => {
        const isTotal = row.key === "total";
        const isMuted = row.key === "paid" || row.key === "due";
        return (
          <div
            key={row.key}
            className={`flex items-center justify-between gap-4 ${isTotal ? "border-t pt-3" : ""}`}
          >
            <dt className={`${isTotal ? "font-semibold text-foreground" : "text-muted-foreground"} ${isMuted ? "text-muted-foreground" : ""}`}>
              {row.label}
            </dt>
            <dd className={`shrink-0 tabular-nums ${isTotal ? "text-base font-semibold" : ""} ${isMuted ? "text-muted-foreground" : ""}`}>
              {row.amount}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default memo(InvoiceTotals);
