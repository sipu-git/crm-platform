import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDealById, useDealMutation } from "@/features/deals/hooks/useDeals";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  Trash2,
  LayoutGrid,
  Activity as ActivityIcon,
  User as UserIcon,
  Target,
  Receipt,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/hooks/use-format";
import { toast } from "sonner";
import { ActivityTab } from "@/features/activities/components/ActivityTabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/currency";

const fmt = formatCurrency;

export function DealDetail() {
  const { tenantSlug = "", dealId = "" } = useParams();
  const dispatch = useAppDispatch();
  const { data: deal, isLoading: loading, isError } = useDealById(dealId);
  const { update: updateDeal, delete: deleteDeal } = useDealMutation();

  const companyName = deal?.leads?.company_name;
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices({ dealId });

  // --- inline amount editing state ---
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

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
      await updateDeal.mutateAsync({ id: deal!.id, value: { amount: parsed } });
      setIsEditingAmount(false);
      toast.success("Amount updated");
    } catch (err) {
      toast.error("Failed to update amount");
    } finally {
      setSavingAmount(false);
    }
  }

  async function handleDeleteDeal() {
    try {
      setIsDeleting(true);
      await deleteDeal.mutateAsync(deal!.id);
      toast.success("Deal deleted");
      navigate(`/${tenantSlug}/deals`);
    } catch (err) {
      toast.error("Failed to delete deal");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  const NAV_ITEMS = [
    { value: "overview", label: "Overview", icon: LayoutGrid, hint: "Amount, stage & notes" },
    { value: "activity", label: "Activity", icon: ActivityIcon, hint: "Calls, emails & tasks" },
    { value: "contacts", label: "Contact", icon: UserIcon, hint: "Primary point of contact" },
    { value: "leads", label: "Lead", icon: Target, hint: "Where this deal came from" },
    {
      value: "invoices",
      label: "Invoices",
      icon: Receipt,
      hint: invoicesLoading ? "Loading…" : `${invoices?.length ?? 0} invoice${invoices?.length === 1 ? "" : "s"}`,
    },
  ] as const;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={deal.title}
        description={`${companyName ?? "No company"} • ${fmt(deal.amount)} • Closes ${new Date(deal.expected_close_date).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" title="Permanently delete this deal">
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

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Sub-sidebar */}
        <aside className="flex shrink-0 flex-col border-b bg-white md:h-full md:w-64 md:border-b-0 md:border-r dark:bg-background">
          <TabsList className="h-auto items-stretch justify-start gap-1 overflow-x-auto rounded-none bg-white p-3 md:flex-col md:overflow-visible dark:bg-background">
            {NAV_ITEMS.map(({ value, label, icon: Icon, hint }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="w-full shrink-0 justify-start gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span>{label}</span>
                  <span className="hidden text-[11px] font-normal text-muted-foreground/70 md:block">
                    {hint}
                  </span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Help note — explains how the page works, tucked out of the way */}
          <div className="hidden p-3 md:mt-auto md:block">
            <div className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <Info className="h-3.5 w-3.5" /> How this page works
              </div>
              Use the tabs above to move between the deal's overview, activity log, contact, lead, and
              invoices. Hover any field with a pencil icon (like Amount) to edit it inline.
            </div>
          </div>
        </aside>

        {/* Tab content */}
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <TabsContent value="overview" className="mt-0 grid gap-4 md:grid-cols-3">
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
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveAmount} disabled={savingAmount} title="Save">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditAmount} disabled={savingAmount} title="Cancel (Esc)">
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
                          title="Click to edit amount"
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
                      title={deal.pipeline?.is_won ? "Deal won" : deal.pipeline?.is_lost ? "Deal lost" : "In progress"}
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
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add a note to record next steps, decision-makers, or blockers.
                </p>
                <p className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  💡 Notes stay with the deal so anyone on the team can catch up without digging through
                  the Activity tab.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityTab
              dealId={deal.id}
              contactId={deal.contact?.id ?? ""}
              companyId={deal.leads?.companyId ?? ""}
              defaultAssigneeId={deal.leads?.assignee?.id ?? null}
            />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Primary contact</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Full Name" value={contactName ?? "—"} />
                <Row label="Designation" value={deal.contact?.designation ?? "—"} />
                <Row label="Email" value={deal.contact?.email ?? "—"} />
                <Row label="Mobile Number" value={deal.contact?.phone ?? "—"} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-0 space-y-6">
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

          <TabsContent value="invoices" className="mt-0">
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
                      <li key={inv.id} onClick={()=>navigate(`/${tenantSlug}/invoices/${inv.id}`)} 
                      className="flex items-center justify-between py-2 cursor-pointer">
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
        </div>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-border">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
