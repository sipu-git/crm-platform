import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/features/invoices/types/invoices.type";

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
  PAID: "bg-success/15 text-success",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground line-through",
};

interface InvoiceStatusActionsProps {
  status: InvoiceStatus;
  isDraft: boolean;
  onSend: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
}

function InvoiceStatusActions({
  status,
  isDraft,
  onSend,
  onMarkPaid,
  onCancel,
}: InvoiceStatusActionsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_COLOR[status]}`}
        >
          {status.replace("_", " ").toLowerCase()}
        </span>
        <div className="flex gap-2">
          {status === "DRAFT" && (
            <Button size="sm" onClick={onSend}>
              Send invoice
            </Button>
          )}
          {(status === "SENT" || status === "OVERDUE" || status === "PARTIALLY_PAID") && (
            <Button size="sm" onClick={onMarkPaid}>
              Mark as paid
            </Button>
          )}
          {status !== "PAID" && status !== "CANCELLED" && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel invoice
            </Button>
          )}
        </div>
      </div>

      {!isDraft && (
        <p className="text-xs text-muted-foreground">
          This invoice has been sent — buyer/seller details and line items are locked. Only its
          status can change from here.
        </p>
      )}
    </>
  );
}

export default memo(InvoiceStatusActions);
