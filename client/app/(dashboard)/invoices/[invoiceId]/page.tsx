import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { format } from "date-fns";

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Invoice.get(invoiceId)
      .then(setInvoice)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleMarkSent = async () => {
    await base44.entities.Invoice.update(invoiceId, { status: "Sent" });
    setInvoice(prev => ({ ...prev, status: "Sent" }));
  };

  const handleMarkPaid = async () => {
    await base44.entities.Invoice.update(invoiceId, { status: "Paid" });
    setInvoice(prev => ({ ...prev, status: "Paid" }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-96 bg-white rounded-xl border" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Invoice not found</p>
        <Link to="/invoices" className="text-indigo-600 text-sm mt-2 inline-block">← Back to invoices</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/invoices" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <div className="flex gap-2">
          {invoice.status === "Draft" && (
            <Button size="sm" onClick={handleMarkSent} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
              <Send className="w-3.5 h-3.5" /> Mark as Sent
            </Button>
          )}
          {invoice.status === "Sent" && (
            <Button size="sm" onClick={handleMarkPaid} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{invoice.invoice_number}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Issue Date</p>
              <p className="text-sm font-medium">{invoice.issue_date ? format(new Date(invoice.issue_date), "MMM d, yyyy") : "—"}</p>
              <p className="text-sm text-slate-500 mt-2">Due Date</p>
              <p className="text-sm font-medium">{invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "—"}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="px-8 py-5 border-b">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Bill To</p>
          <p className="text-sm font-medium text-slate-800">{invoice.contact_name}</p>
          {invoice.company && <p className="text-sm text-slate-500">{invoice.company}</p>}
          {invoice.contact_email && <p className="text-sm text-slate-500">{invoice.contact_email}</p>}
        </div>

        {/* Line Items */}
        <div className="px-8 py-5">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-medium text-slate-500 uppercase pb-2">Description</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase pb-2 w-20">Qty</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase pb-2 w-28">Price</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase pb-2 w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(invoice.line_items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-sm text-slate-800">{item.description || "—"}</td>
                  <td className="py-3 text-sm text-slate-600 text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-slate-600 text-right">${(item.unit_price || 0).toLocaleString()}</td>
                  <td className="py-3 text-sm font-medium text-slate-800 text-right">
                    ${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-5 bg-slate-50/50 border-t">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex justify-between w-48 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${(invoice.subtotal || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-48 text-sm">
              <span className="text-slate-500">Tax ({invoice.tax_rate || 0}%)</span>
              <span className="font-medium">${(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-base font-bold border-t pt-2 mt-1">
              <span>Total</span>
              <span>${(invoice.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-8 py-5 border-t">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Notes</p>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}