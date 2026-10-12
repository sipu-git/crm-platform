import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useInvoiceById, useInvoiceMutation } from "@/features/invoices/hooks/useInvoices";
import type { Company } from "@/features/companies/types/companies.types";
import type { CreateInvoiceLineItemInput, Invoice } from "@/features/invoices/types/invoices.type";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import InvoiceHeader from "@/features/invoices/components/InvoiceHeader";
import InvoiceStatusActions from "@/features/invoices/components/InvoiceStatusActions";
import type {
  BuyerDetailsDraft,
  InvoiceMetaDraft,
} from "@/features/invoices/components/invoice-detail.types";

const SellerDetails = lazy(() => import("@/features/invoices/components/SellerDetails"));
const BuyerDetails = lazy(() => import("@/features/invoices/components/BuyerDetails"));
const InvoiceMeta = lazy(() => import("@/features/invoices/components/InvoiceMeta"));
const InvoiceNotes = lazy(() => import("@/features/invoices/components/InvoiceNotes"));
const InvoiceLineItems = lazy(() => import("@/features/invoices/components/InvoiceLineItems"));

function DeferredSection({
  children,
  placeholderClassName,
  priority = false,
}: {
  children: ReactNode;
  placeholderClassName: string;
  priority?: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(priority);

  useEffect(() => {
    if (shouldRender) return;
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={sectionRef} className="min-w-0">
      {shouldRender ? (
        <Suspense fallback={<div aria-hidden="true" className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : (
        <div aria-hidden="true" className={placeholderClassName} />
      )}
    </div>
  );
}

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
  const auth = useAuthPayload();
  const isClient = auth?.user.role === "CLIENT";
  const [saving, setSaving] = useState(false);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const [PrintDocument, setPrintDocument] = useState<ComponentType<{
    invoice: Invoice;
    onReady: () => void;
  }> | null>(null);
  const printRequestedRef = useRef(false);
  const printStartedRef = useRef(false);

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

  const handleSaveAsPdf = useCallback(async () => {
    if (printStartedRef.current || printRequestedRef.current) return;
    printRequestedRef.current = true;
    setIsPreparingPdf(true);
    try {
      const module = await import("@/features/invoices/components/InvoicePrintDocument");
      setPrintDocument(() => module.default);
    } catch {
      printRequestedRef.current = false;
      setIsPreparingPdf(false);
      toast.error("Unable to prepare the invoice PDF");
    }
  }, []);

  const handlePrintDocumentReady = useCallback(() => {
    if (!printRequestedRef.current || printStartedRef.current) return;
    printRequestedRef.current = false;
    printStartedRef.current = true;
    setIsPreparingPdf(false);

    const finishPrint = () => {
      document.body.classList.remove("invoice-printing");
      printStartedRef.current = false;
      setPrintDocument(null);
    };

    window.addEventListener("afterprint", finishPrint, { once: true });
    document.body.classList.add("invoice-printing");
    window.print();
  }, []);

  const handleCreateItem = useCallback(
    async (draft: CreateInvoiceLineItemInput) => {
      if (!currentInvoiceId) return false;
      try {
        await createInvoiceItem.mutateAsync({ invoiceId: currentInvoiceId, value: draft });
        toast.success("Line item added");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add line item");
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update line item");
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
        onSaveAsPdf={handleSaveAsPdf}
        isPreparingPdf={isPreparingPdf}
      />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-12">
          <section aria-label="Invoice details" className="min-w-0 space-y-4 xl:col-span-5">
            <InvoiceStatusActions
              status={invoice.status}
              isDraft={Boolean(isDraft)}
              onSend={handleSend}
              onMarkPaid={handleMarkPaid}
              onCancel={handleCancel}
            />

            <DeferredSection priority placeholderClassName="h-[300px] animate-pulse rounded-lg bg-muted/40">
              <SellerDetails invoice={invoice} isDraft={Boolean(isDraft)} saving={saving} />
            </DeferredSection>
            <DeferredSection placeholderClassName="h-[340px] animate-pulse rounded-lg bg-muted/40">
              <BuyerDetails
                invoice={invoice}
                tenantSlug={tenantSlug}
                isDraft={Boolean(isDraft)}
                saving={saving}
                onPopulateCompany={handlePopulateFromCompany}
              />
            </DeferredSection>
            <DeferredSection placeholderClassName="h-[200px] animate-pulse rounded-lg bg-muted/40">
              <InvoiceMeta invoice={invoice} />
            </DeferredSection>
            <DeferredSection placeholderClassName="h-[190px] animate-pulse rounded-lg bg-muted/40">
              <InvoiceNotes
                invoice={invoice}
                isDraft={Boolean(isDraft)}
                saving={saving}
                onSave={saveMeta}
              />
            </DeferredSection>
          </section>

          <section aria-label="Invoice item details" className="min-w-0 xl:col-span-7">
            <DeferredSection placeholderClassName="min-h-[420px] animate-pulse rounded-lg bg-muted/40">
              <InvoiceLineItems
                invoice={invoice}
                isDraft={Boolean(isDraft)}
                onCreateItem={handleCreateItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
              />
            </DeferredSection>
          </section>
        </div>
      </main>
      {PrintDocument && createPortal(
        <div id="invoice-print-root">
          <PrintDocument invoice={invoice} onReady={handlePrintDocumentReady} />
        </div>,
        document.body,
      )}
    </div>
  );
}
