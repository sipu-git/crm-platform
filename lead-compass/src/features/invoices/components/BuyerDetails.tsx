import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InvoiceField from "@/features/invoices/components/InvoiceField";
import CompanySelector from "@/features/invoices/components/CompanySelector";
import type { Company } from "@/features/companies/types/companies.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { BuyerDetailsDraft } from "@/features/invoices/components/invoice-detail.types";

function createDraft(invoice: Invoice): BuyerDetailsDraft {
  return {
    buyer_name: invoice.buyer_name,
    buyer_gstin: invoice.buyer_gstin ?? "",
    buyer_address: invoice.buyer_address ?? "",
    buyer_state: invoice.buyer_state ?? "",
  };
}

interface BuyerDetailsProps {
  invoice: Invoice;
  companies: Company[];
  tenantSlug: string;
  isDraft: boolean;
  saving: boolean;
  onPopulateCompany: (company: Company, draft: BuyerDetailsDraft) => void;
}

function BuyerDetails({
  invoice,
  companies,
  tenantSlug,
  isDraft,
  saving,
  onPopulateCompany,
}: BuyerDetailsProps) {
  const [draft, setDraft] = useState(() => createDraft(invoice));

  useEffect(() => {
    setDraft(createDraft(invoice));
  }, [invoice]);

  const normalizedBuyerName = draft.buyer_name.toLowerCase();
  const matchedCompany = useMemo(
    () =>
      companies.find(
        (company) =>
          (company.name &&
            normalizedBuyerName &&
            company.name.toLowerCase() === normalizedBuyerName) ||
          (company.legal_name &&
            normalizedBuyerName &&
            company.legal_name.toLowerCase() === normalizedBuyerName) ||
          (company.gst_number && draft.buyer_gstin && company.gst_number === draft.buyer_gstin),
      ),
    [companies, normalizedBuyerName, draft.buyer_gstin],
  );

  const handleCompanySelect = useCallback(
    (company: Company) => {
      const buyerName = company.legal_name || company.name;
      const buyerGstin = company.gst_number || "";
      const buyerAddress =
        company.billing_address ||
        [
          company.address_line1,
          company.address_line2,
          company.city,
          company.state,
          company.postal_code,
        ]
          .filter(Boolean)
          .join(", ") ||
        "";
      const buyerState = company.place_of_supply || company.state || "";
      const updatedDraft = {
        buyer_name: buyerName,
        buyer_gstin: buyerGstin,
        buyer_address: buyerAddress,
        buyer_state: buyerState,
      };

      setDraft(updatedDraft);
      onPopulateCompany(company, updatedDraft);
    },
    [onPopulateCompany],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Buyer details</CardTitle>
        </div>
        <CompanySelector companies={companies} isDraft={isDraft} onSelect={handleCompanySelect} />
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        {matchedCompany && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-primary">
              <Building2 className="h-3.5 w-3.5" />
              <span className="font-semibold">{matchedCompany.name}</span>
            </div>
            <Link
              to={`/${tenantSlug}/company/${matchedCompany.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <span>View Profile</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
        )}
        <InvoiceField label="Buyer name">
          <Input
            value={draft.buyer_name}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, buyer_name: event.target.value }))
            }
            placeholder="Client / Company Name"
          />
        </InvoiceField>
        <InvoiceField label="Buyer GSTIN">
          <Input
            value={draft.buyer_gstin}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                buyer_gstin: event.target.value.toUpperCase(),
              }))
            }
            placeholder="e.g. 27AAPFU0939F1ZV"
            className="font-mono uppercase"
          />
        </InvoiceField>
        <InvoiceField label="Buyer address">
          <Input
            value={draft.buyer_address}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, buyer_address: event.target.value }))
            }
            placeholder="Registered office or billing address"
          />
        </InvoiceField>
        <InvoiceField label="Buyer state / Place of Supply">
          <Input
            value={draft.buyer_state}
            disabled={!isDraft || saving}
            onChange={(event) =>
              setDraft((current) => ({ ...current, buyer_state: event.target.value }))
            }
            placeholder="e.g. Maharashtra or 27"
          />
        </InvoiceField>
      </CardContent>
    </Card>
  );
}

export default memo(BuyerDetails);
