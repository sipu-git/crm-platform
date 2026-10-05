import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useInvoiceById, useInvoiceMutation } from "@/features/invoices/hooks/useInvoices";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import type { Company } from "@/features/companies/types/companies.types";
import type { CreateInvoiceLineItemInput, Invoice } from "@/features/invoices/types/invoices.type";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import InvoiceHeader from "@/features/invoices/components/InvoiceHeader";
import InvoiceStatusActions from "@/features/invoices/components/InvoiceStatusActions";
import SellerDetails from "@/features/invoices/components/SellerDetails";
import BuyerDetails from "@/features/invoices/components/BuyerDetails";
import InvoiceMeta from "@/features/invoices/components/InvoiceMeta";
import InvoiceNotes from "@/features/invoices/components/InvoiceNotes";
import InvoiceLineItemsSkeleton from "@/features/invoices/components/InvoiceLineItemsSkeleton";
import type {
  BuyerDetailsDraft,
  InvoiceMetaDraft,
} from "@/features/invoices/components/invoice-detail.types";

const EMPTY_COMPANIES: Company[] = [];

const InvoiceLineItems = lazy(() => import("@/features/invoices/components/InvoiceLineItems"));

export default function InvoiceDetail() {
  const { tenantSlug = "", invoiceId = "" } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading: loading } = useInvoiceById(invoiceId);
  const {
    update: updateInvoice,
    delete: deleteInvoice,
    markPaid: markInvoicePaid,
    createItem: createInvoiceItem,
    updateItem: updateInvoiceItem,
    deleteItem: deleteInvoiceItem,
  } = useInvoiceMutation();
  const { data: companies = EMPTY_COMPANIES } = useCompanies();
  const auth = useAuthPayload();
  const isClient = auth?.user.role === "CLIENT";
  const [saving, setSaving] = useState(false);

  const isDraft = invoice?.status === "DRAFT" && !isClient;
  const currentInvoiceId = invoice?.id;

  const handlePopulateFromCompany = useCallback(
    async (company: Company, updated: BuyerDetailsDraft) => {
      if (!currentInvoiceId) return;
      setSaving(true);
      try {
        await updateInvoice.mutateAsync({ id: currentInvoiceId, value: updated });
        toast.success(`Populated buyer information from "${company.name}"`);
      } catch {
        toast.error("Failed to auto-save populated buyer details");
      } finally {
        setSaving(false);
      }
    },
    [currentInvoiceId, updateInvoice.mutateAsync],
  );

  const saveMeta = useCallback(
    async (metaDraft: InvoiceMetaDraft) => {
      if (!currentInvoiceId) return;
      setSaving(true);
      try {
        await updateInvoice.mutateAsync({ id: currentInvoiceId, value: metaDraft });
        toast.success("Saved");
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [currentInvoiceId, updateInvoice.mutateAsync],
  );

  const handleSend = useCallback(async () => {
    if (!currentInvoiceId) return;
    try {
      await updateInvoice.mutateAsync({ id: currentInvoiceId, value: { status: "SENT" } });
      toast.success("Invoice sent");
    } catch {
      toast.error("Failed to update status");
    }
  }, [currentInvoiceId, updateInvoice.mutateAsync]);

  const handleCancel = useCallback(async () => {
    if (!currentInvoiceId) return;
    try {
      await updateInvoice.mutateAsync({ id: currentInvoiceId, value: { status: "CANCELLED" } });
      toast.success("Invoice cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  }, [currentInvoiceId, updateInvoice.mutateAsync]);

  const handleMarkPaid = useCallback(async () => {
    if (!currentInvoiceId) return;
    try {
      await markInvoicePaid.mutateAsync(currentInvoiceId);
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to mark as paid");
    }
  }, [currentInvoiceId, markInvoicePaid.mutateAsync]);

  const handleDelete = useCallback(async () => {
    if (!currentInvoiceId) return;
    try {
      await deleteInvoice.mutateAsync(currentInvoiceId);
      toast.success("Invoice deleted");
      navigate(`/${tenantSlug}/invoices`);
    } catch {
      toast.error("Failed to delete — only draft invoices can be deleted");
    }
  }, [currentInvoiceId, deleteInvoice.mutateAsync, navigate, tenantSlug]);

  const handleCreateItem = useCallback(
    async (draft: CreateInvoiceLineItemInput) => {
      if (!currentInvoiceId) return false;
      try {
        await createInvoiceItem.mutateAsync({ invoiceId: currentInvoiceId, value: draft });
        toast.success("Line item added");
        return true;
      } catch {
        toast.error("Failed to add line item");
        return false;
      }
    },
    [currentInvoiceId, createInvoiceItem.mutateAsync],
  );

  const handleUpdateItem = useCallback(
    async (itemId: string, draft: CreateInvoiceLineItemInput) => {
      if (!currentInvoiceId) return false;
      try {
        await updateInvoiceItem.mutateAsync({ invoiceId: currentInvoiceId, itemId, value: draft });
        toast.success("Line item updated");
        return true;
      } catch {
        toast.error("Failed to update line item");
        return false;
      }
    },
    [currentInvoiceId, updateInvoiceItem.mutateAsync],
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!currentInvoiceId) return;
      try {
        await deleteInvoiceItem.mutateAsync({ invoiceId: currentInvoiceId, itemId });
        toast.success("Line item removed");
      } catch {
        toast.error("Failed to remove line item");
      }
    },
    [currentInvoiceId, deleteInvoiceItem.mutateAsync],
  );

  if (loading && !invoice) {
    return <div className="p-6 text-sm text-muted-foreground">Loading invoice…</div>;
  }
  if (!invoice) {
    return <div className="p-6 text-sm text-muted-foreground">Invoice not found.</div>;
  }

  return (
    <div>
      <InvoiceHeader
        invoice={invoice}
        tenantSlug={tenantSlug}
        isDraft={Boolean(isDraft)}
        onDelete={handleDelete}
      />
      <div className="space-y-6 p-6">
        <InvoiceStatusActions
          status={invoice.status}
          isDraft={Boolean(isDraft)}
          onSend={handleSend}
          onMarkPaid={handleMarkPaid}
          onCancel={handleCancel}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SellerDetails invoice={invoice} isDraft={Boolean(isDraft)} saving={saving} />
          <BuyerDetails
            invoice={invoice}
            companies={companies}
            tenantSlug={tenantSlug}
            isDraft={Boolean(isDraft)}
            saving={saving}
            onPopulateCompany={handlePopulateFromCompany}
          />
        </div>

        <InvoiceMeta invoice={invoice} />

        <Suspense fallback={<InvoiceLineItemsSkeleton />}>
          <InvoiceLineItems
            invoice={invoice}
            isDraft={Boolean(isDraft)}
            onCreateItem={handleCreateItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        </Suspense>

        <InvoiceNotes
          invoice={invoice}
          isDraft={Boolean(isDraft)}
          saving={saving}
          onSave={saveMeta}
        />
      </div>
    </div>
  );
}