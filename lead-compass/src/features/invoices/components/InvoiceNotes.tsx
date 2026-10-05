import { memo, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import InvoiceField from "@/features/invoices/components/InvoiceField";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { InvoiceMetaDraft } from "@/features/invoices/components/invoice-detail.types";

function createDraft(invoice: Invoice): InvoiceMetaDraft {
  return {
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
  };
}

interface InvoiceNotesProps {
  invoice: Invoice;
  isDraft: boolean;
  saving: boolean;
  onSave: (draft: InvoiceMetaDraft) => void;
}

function InvoiceNotes({ invoice, isDraft, saving, onSave }: InvoiceNotesProps) {
  const [draft, setDraft] = useState(() => createDraft(invoice));

  useEffect(() => {
    setDraft(createDraft(invoice));
  }, [invoice]);

  const handleBlur = useCallback(() => onSave(draft), [draft, onSave]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Notes &amp; terms</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
        <InvoiceField label="Notes">
          <Textarea
            value={draft.notes}
            disabled={!isDraft || saving}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            onBlur={handleBlur}
            placeholder="—"
            rows={3}
          />
        </InvoiceField>
        <InvoiceField label="Terms">
          <Textarea
            value={draft.terms}
            disabled={!isDraft || saving}
            onChange={(event) => setDraft((current) => ({ ...current, terms: event.target.value }))}
            onBlur={handleBlur}
            placeholder="—"
            rows={3}
          />
        </InvoiceField>
      </CardContent>
    </Card>
  );
}

export default memo(InvoiceNotes);
