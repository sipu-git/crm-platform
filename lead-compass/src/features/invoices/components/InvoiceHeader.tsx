import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/features/invoices/types/invoices.type";

interface InvoiceHeaderProps {
  invoice: Invoice;
  tenantSlug: string;
  isDraft: boolean;
  onDelete: () => void;
}

function InvoiceHeader({ invoice, tenantSlug, isDraft, onDelete }: InvoiceHeaderProps) {
  return (
    <PageHeader
      title={invoice.invoice_number}
      description={`${invoice.buyer_name} • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/${tenantSlug}/invoices`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          {isDraft && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      }
    />
  );
}

export default memo(InvoiceHeader);
