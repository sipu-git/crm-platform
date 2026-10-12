import { memo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InvoiceField from "@/features/invoices/components/InvoiceField";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { SellerDetailsDraft } from "@/features/invoices/components/invoice-detail.types";

function createDraft(invoice: Invoice): SellerDetailsDraft {
  return {
    seller_name: invoice.seller_name,
    seller_gstin: invoice.seller_gstin ?? "",
    seller_address: invoice.seller_address ?? "",
    seller_state: invoice.seller_state ?? "",
  };
}

function SellerDetails({
  invoice,
  isDraft,
  saving,
}: {
  invoice: Invoice;
  isDraft: boolean;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(() => createDraft(invoice));

  useEffect(() => {
    setDraft(createDraft(invoice));
  }, [invoice]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Seller details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-x-4 gap-y-3 py-2 xl:grid-cols-2">
        <InvoiceField label="Seller name">
          <Input
            value={draft.seller_name}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, seller_name: event.target.value }))
            }
          />
        </InvoiceField>
        <InvoiceField label="Seller GSTIN">
          <Input
            value={draft.seller_gstin}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, seller_gstin: event.target.value }))
            }
            placeholder="—"
          />
        </InvoiceField>
        <InvoiceField label="Seller address" className="xl:col-span-2">
          <Input
            value={draft.seller_address}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, seller_address: event.target.value }))
            }
            placeholder="—"
          />
        </InvoiceField>
        <InvoiceField label="Seller state" className="xl:col-span-2">
          <Input
            value={draft.seller_state}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, seller_state: event.target.value }))
            }
            placeholder="—"
          />
        </InvoiceField>
      </CardContent>
    </Card>
  );
}

export default memo(SellerDetails);
