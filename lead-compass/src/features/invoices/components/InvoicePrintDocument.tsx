import { useEffect } from "react";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { InvoiceItem } from "@/features/invoices/types/items.types";
import InvoiceTotals from "@/features/invoices/components/InvoiceTotals";
import { formatInvoiceAmount } from "@/features/invoices/components/invoice-detail.utils";

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatTaxRates(item: InvoiceItem) {
  const rates = [
    Number(item.cgst_rate) > 0 ? `CGST ${Number(item.cgst_rate)}%` : null,
    Number(item.sgst_rate) > 0 ? `SGST ${Number(item.sgst_rate)}%` : null,
    Number(item.igst_rate) > 0 ? `IGST ${Number(item.igst_rate)}%` : null,
  ].filter(Boolean);

  return rates.length ? rates.join(" / ") : "No tax";
}

function InvoiceAddress({
  name,
  address,
  state,
  gstin,
}: {
  name: string;
  address: string | null | undefined;
  state: string | null | undefined;
  gstin: string | null | undefined;
}) {
  return (
    <address className="not-italic">
      <p className="font-semibold text-slate-950">{name || "—"}</p>
      {address && <p className="mt-1 whitespace-pre-line text-slate-700">{address}</p>}
      {state && <p className="mt-1 text-slate-700">State / place of supply: {state}</p>}
      {gstin && <p className="mt-1 font-mono text-slate-700">GSTIN: {gstin}</p>}
    </address>
  );
}

export default function InvoicePrintDocument({
  invoice,
  onReady,
}: {
  invoice: Invoice;
  onReady: () => void;
}) {
  const items = invoice.items ?? [];

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <article className="invoice-print-page mx-auto max-w-[210mm] bg-white text-[10pt] leading-relaxed text-slate-900">
      <header className="flex items-start justify-between gap-8 border-b-2 border-slate-900 pb-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">From</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            {invoice.seller_name || "Seller"}
          </h2>
          {invoice.seller_address && (
            <p className="mt-1 max-w-sm whitespace-pre-line text-sm text-slate-600">
              {invoice.seller_address}
            </p>
          )}
          {invoice.seller_state && (
            <p className="mt-1 text-sm text-slate-600">State: {invoice.seller_state}</p>
          )}
          {invoice.seller_gstin && (
            <p className="mt-1 font-mono text-xs text-slate-600">GSTIN: {invoice.seller_gstin}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {invoice.invoice_type.replace(/_/g, " ")}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">INVOICE</h1>
          <p className="mt-2 text-base font-semibold">{invoice.invoice_number}</p>
          <span className="mt-2 inline-flex rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
            {invoice.status.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <section className="invoice-print-section grid grid-cols-2 gap-8 border-b border-slate-200 py-5">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Bill to
          </h2>
          <InvoiceAddress
            name={invoice.buyer_name}
            address={invoice.buyer_address}
            state={invoice.buyer_state}
            gstin={invoice.buyer_gstin}
          />
        </div>
        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Issue date</dt>
            <dd className="mt-0.5 font-medium">{formatDate(invoice.issue_date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Due date</dt>
            <dd className="mt-0.5 font-medium">{formatDate(invoice.due_date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Currency</dt>
            <dd className="mt-0.5 font-medium">{invoice.currency}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Invoice type</dt>
            <dd className="mt-0.5 font-medium">{invoice.invoice_type.replace(/_/g, " ")}</dd>
          </div>
          {invoice.paid_at && (
            <div className="col-span-2">
              <dt className="text-xs text-slate-500">Paid at</dt>
              <dd className="mt-0.5 font-medium">
                {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(invoice.paid_at),
                )}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="invoice-items-section py-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-950">Invoice items</h2>
        {items.length === 0 ? (
          <p className="rounded border border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            No invoice items.
          </p>
        ) : (
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="border-y border-slate-300 bg-slate-50 text-left text-[9pt] uppercase tracking-wide text-slate-600">
                <th className="px-2.5 py-2 font-semibold">Description</th>
                <th className="px-2 py-2 font-semibold">HSN / SAC</th>
                <th className="px-2 py-2 text-right font-semibold">Qty</th>
                <th className="px-2 py-2 text-right font-semibold">Unit price</th>
                <th className="px-2 py-2 text-right font-semibold">Discount</th>
                <th className="px-2 py-2 font-semibold">GST</th>
                <th className="px-2 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const taxAmount =
                  Number(item.cgst_amount) + Number(item.sgst_amount) + Number(item.igst_amount);

                return (
                  <tr key={item.id} className="invoice-print-section border-b border-slate-200 align-top">
                    <td className="px-2.5 py-2.5 font-medium text-slate-900">{item.description}</td>
                    <td className="px-2 py-2.5 text-slate-600">
                      {[item.hsn_code && `HSN ${item.hsn_code}`, item.sac_code && `SAC ${item.sac_code}`]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{Number(item.quantity).toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {formatInvoiceAmount(Number(item.unit_price), invoice.currency)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {formatInvoiceAmount(Number(item.discount_amount), invoice.currency)}
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="block whitespace-normal text-[8pt] text-slate-700">{formatTaxRates(item)}</span>
                      <span className="mt-0.5 block text-slate-500">
                        {formatInvoiceAmount(taxAmount, invoice.currency)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">
                      {formatInvoiceAmount(Number(item.total_amount), invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="invoice-print-section border-t border-slate-200 pt-4">
        <InvoiceTotals invoice={invoice} />
      </section>

      {(invoice.notes || invoice.terms) && (
        <section className="invoice-print-section mt-6 grid grid-cols-2 gap-8 border-t border-slate-200 pt-5">
          {invoice.notes && (
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Notes
              </h2>
              <p className="whitespace-pre-line text-sm text-slate-700">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Terms
              </h2>
              <p className="whitespace-pre-line text-sm text-slate-700">{invoice.terms}</p>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
