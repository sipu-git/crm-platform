import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDeal, updateDeal, selectDealDetail, selectDealsLoading, clearDealDetail, deleteDeal } from "@/features/deals/slice";
import { fetchInvoices, selectInvoices, selectInvoicesLoading } from "@/features/invoices/service2/slice";
import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/hooks/use-format";
import { toast } from "sonner";
import { ActivityTab } from "@/components/activities/ActivityTabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function DealDetail() {
  const { tenantSlug = "", dealId = "" } = useParams();
  const dispatch = useAppDispatch();
  const deal = useAppSelector(selectDealDetail);
  const loading = useAppSelector(selectDealsLoading);

  const companyName = deal?.leads?.company_name;
  const invoices = useAppSelector(selectInvoices);
  const invoicesLoading = useAppSelector(selectInvoicesLoading);

  // --- inline amount editing state ---
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    if (dealId) dispatch(fetchDeal(dealId));
    return () => {
      dispatch(clearDealDetail());
    };
  }, [dispatch, dealId]);

  useEffect(() => {
    if (dealId) dispatch(fetchInvoices({ dealId }));
  }, [dispatch, dealId]);

  // reset draft whenever the underlying deal amount changes (fresh fetch, cancel, etc.)
  useEffect(() => {
    if (deal) setAmountDraft(String(deal.amount));
  }, [deal?.amount]);

  if (loading && !deal) {
    return (
      <div className="p-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/${tenantSlug}/deals`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to deals</Link>
        </Button>
        <div className="mt-6 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading deal…
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/${tenantSlug}/deals`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to deals</Link>
        </Button>
        <div className="mt-6 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Deal not found. It may have been deleted.
        </div>
      </div>
    );
  }

  const contactName = formatFullName(deal.contact?.first_name, deal.contact?.last_name);

  function startEditAmount() {
    setAmountDraft(String(deal!.amount));
    setIsEditingAmount(true);
  }

  function cancelEditAmount() {
    setAmountDraft(String(deal!.amount));
    setIsEditingAmount(false);
  }

  async function saveAmount() {
    const parsed = Number(amountDraft);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (parsed === deal!.amount) {
      setIsEditingAmount(false);
      return;
    }
    try {
      setSavingAmount(true);
      await dispatch(updateDeal({ id: deal!.id, changes: { amount: parsed } })).unwrap();
      setIsEditingAmount(false);
    } catch (err) {
      toast.error("Failed to update amount");
    } finally {
      setSavingAmount(false);
    }
  }

  async function handleDeleteDeal() {
    try {
      setIsDeleting(true);
      await dispatch(deleteDeal(deal!.id)).unwrap();
      toast.success("Deal deleted");
      navigate(`/${tenantSlug}/deals`);
    } catch (err) {
      toast.error("Failed to delete deal");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={deal.title}
        description={`${companyName ?? "No company"} • ${fmt(deal.amount)} • Closes ${new Date(deal.expected_close_date).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{deal.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteDeal}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button asChild variant="outline">
              <Link to={`/${tenantSlug}/deals`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="contacts">Contact</TabsTrigger>
            <TabsTrigger value="leads">Lead</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Company" value={companyName ?? "—"} />

                <Row
                  label="Amount"
                  value={
                    isEditingAmount ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          autoFocus
                          type="number"
                          min={0}
                          value={amountDraft}
                          onChange={(e) => setAmountDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveAmount();
                            if (e.key === "Escape") cancelEditAmount();
                          }}
                          disabled={savingAmount}
                          className="h-7 w-28 text-right"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={saveAmount}
                          disabled={savingAmount}
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={cancelEditAmount}
                          disabled={savingAmount}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-1.5">
                        <span>{fmt(deal.amount)}</span>
                        <button
                          type="button"
                          onClick={startEditAmount}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Edit amount"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )
                  }
                />

                <Row
                  label="Stage"
                  value={
                    <Badge
                      variant="secondary"
                      className="capitalize"
                      style={{
                        backgroundColor: deal.pipeline?.is_won
                          ? "#22c55e1a"
                          : deal.pipeline?.is_lost
                            ? "#ef44441a"
                            : undefined,
                        color: deal.pipeline?.is_won
                          ? "#22c55e"
                          : deal.pipeline?.is_lost
                            ? "#ef4444"
                            : undefined,
                      }}
                    >
                      {deal.pipeline?.name ?? "—"}
                    </Badge>
                  }
                />
                <Row label="Owner" value={deal.owner?.full_name ?? "—"} />
                <Row label="Close date" value={new Date(deal.expected_close_date).toLocaleDateString()} />
                <Row label="Created" value={deal.created_at ? new Date(deal.created_at).toLocaleDateString() : "—"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add a note to record next steps, decision-makers, or blockers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityTab
              dealId={deal.id}
              contactId={deal.contact?.id ?? ""}
              companyId={deal.leads?.companyId ?? ""}
              defaultAssigneeId={deal.leads?.assignee?.id ?? null}
            />
          </TabsContent>

          <TabsContent value="contacts" className="mt-4 space-y-6">
            <Card>
              <CardContent className="space-y-6 py-4 text-sm">
                <Row label="Full Name" value={contactName ?? "—"} />
                <Row label="Designation" value={deal.contact?.designation ?? "—"} />
                <Row label="Email" value={deal.contact?.email ?? "—"} />
                <Row label="Mobile Number" value={deal.contact?.phone ?? "—"} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-4 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Lead details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Project" value={deal.leads?.project_name ?? "—"} />
                <Row label="Project Category" value={deal.leads?.project_type ?? "—"} />
                <Row label="Source" value={deal.leads?.source ?? "—"} />
                <Row label="Created" value={deal.leads?.created_At ? new Date(deal.leads?.created_At).toLocaleDateString() : "—"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Assigned to</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {deal.leads?.assignee ? (
                  <>
                    <Row label="Name" value={deal.leads.assignee.full_name} />
                    <Row label="Designation" value={deal.leads.assignee.designation ?? "—"} />
                  </>
                ) : (
                  <div className="py-2 text-center text-muted-foreground">
                    This lead hasn't been assigned yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardContent className="py-2 text-sm">
                {invoicesLoading && !invoices?.length ? (
                  <div className="py-6 text-center text-muted-foreground">
                    Loading invoices…
                  </div>
                ) : !invoices || invoices.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    No invoices for this deal yet.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {invoices.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-medium">{inv.invoice_number}</span>
                          <span className="ml-2 text-muted-foreground">
                            {fmt(Number(inv.total_amount))}
                          </span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {inv.status.replace("_", " ").toLowerCase()}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}