import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InvoiceField from "@/features/invoices/components/InvoiceField";
import type { Invoice } from "@/features/invoices/types/invoices.type";

function InvoiceMeta({ invoice }: { invoice: Invoice }) {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-4 py-4 md:grid-cols-3">
        <InvoiceField label="Issue date">
          <Input type="date" value={invoice.issue_date.slice(0, 10)} disabled />
        </InvoiceField>
        <InvoiceField label="Due date">
          <Input type="date" value={invoice.due_date.slice(0, 10)} disabled />
        </InvoiceField>
        <InvoiceField label="Currency">
          <Input value={invoice.currency} disabled />
        </InvoiceField>
        {invoice.paid_at && (
          <InvoiceField label="Paid at">
            <Input value={new Date(invoice.paid_at).toLocaleString()} disabled />
          </InvoiceField>
        )}
        <InvoiceField label="Invoice type">
          <Input value={invoice.invoice_type} disabled />
        </InvoiceField>
      </CardContent>
    </Card>
  );
}

export default memo(InvoiceMeta);
