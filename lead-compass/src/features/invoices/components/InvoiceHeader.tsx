import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Printer, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/features/invoices/types/invoices.type";

interface InvoiceHeaderProps {
  invoice: Invoice;
  tenantSlug: string;
  isDraft: boolean;
  onDelete: () => void;
  onSaveAsPdf: () => void;
  isPreparingPdf: boolean;
}

function InvoiceHeader({
  invoice,
  tenantSlug,
  isDraft,
  onDelete,
  onSaveAsPdf,
  isPreparingPdf,
}: InvoiceHeaderProps) {
  return (
    <PageHeader
      title={invoice.invoice_number}
      description={`${invoice.buyer_name} • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            aria-label="Print or save invoice as PDF"
            title="Print or save invoice as PDF"
            onClick={onSaveAsPdf}
            disabled={isPreparingPdf}
          >
            {isPreparingPdf ? (
              <LoaderCircle className="h-4 w-4 animate-spin sm:mr-2" />
            ) : (
              <Printer className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isPreparingPdf ? "Preparing…" : "Save as PDF"}</span>
          </Button>
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
