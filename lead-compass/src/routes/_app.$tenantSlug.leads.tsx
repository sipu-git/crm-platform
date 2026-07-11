import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  bulkLeadAction,
  clearSelection,
  createLead,
  deleteLead,
  fetchLeads,
  leadsSelectors,
  selectAll,
  toggleSelected,
  updateLead,
} from "@/features/leads/slice";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Users } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/mockDb";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/$tenantSlug/leads")({
  ssr: false,
  component: LeadsPage,
});

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-warning/15 text-warning",
  qualified: "bg-success/15 text-success",
  unqualified: "bg-muted text-muted-foreground",
};

function LeadsPage() {
  const { tenantSlug } = Route.useParams();
  const dispatch = useAppDispatch();
  const leads = useAppSelector(leadsSelectors.selectAll);
  const status = useAppSelector((s) => s.leads.status);
  const selectedIds = useAppSelector((s) => s.leads.selectedIds);
  const users = useAppSelector((s) => s.auth.tenants.length ? s.auth : s.auth);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLeads(tenantSlug));
    return () => {
      dispatch(clearSelection());
    };
  }, [dispatch, tenantSlug]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (
        query &&
        !(l.name.toLowerCase().includes(query) ||
          l.company.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query))
      )
        return false;
      return true;
    });
  }, [leads, q, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selectedIds.includes(l.id));

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Prospects and inbound contacts across your workspace."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New lead
          </Button>
        }
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company"
              className="h-9 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-md border bg-card px-2 py-1 text-sm">
              <span className="text-muted-foreground">{selectedIds.length} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await dispatch(
                    bulkLeadAction({
                      tenantSlug,
                      action: "assign",
                      ids: selectedIds,
                      assignedTo: "u_1",
                    }),
                  );
                  toast.success("Reassigned to Alex Morgan");
                }}
              >
                <Users className="mr-2 h-3 w-3" /> Assign to me
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await dispatch(
                    bulkLeadAction({ tenantSlug, action: "delete", ids: selectedIds }),
                  );
                  toast.success("Deleted");
                }}
              >
                <Trash2 className="mr-2 h-3 w-3" /> Delete
              </Button>
            </div>
          )}
        </div>

        {status === "loading" && leads.length === 0 && <TableSkeleton />}
        {status !== "loading" && filtered.length === 0 && (
          <EmptyState
            title="No leads found"
            description="Try clearing filters or add a new lead to get started."
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New lead</Button>}
          />
        )}
        {filtered.length > 0 && (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => {
                        if (v) dispatch(selectAll(filtered.map((l) => l.id)));
                        else dispatch(clearSelection());
                      }}
                    />
                  </th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setOpenId(l.id)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(l.id)}
                        onCheckedChange={() => dispatch(toggleSelected(l.id))}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{l.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{l.company}</td>
                    <td className="px-3 py-2 capitalize text-muted-foreground">{l.source}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          STATUS_COLORS[l.status]
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{l.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeadDrawer
        tenantSlug={tenantSlug}
        leadId={openId}
        onClose={() => setOpenId(null)}
      />
      <LeadFormDialog
        tenantSlug={tenantSlug}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function LeadDrawer({
  tenantSlug,
  leadId,
  onClose,
}: {
  tenantSlug: string;
  leadId: string | null;
  onClose: () => void;
}) {
  const lead = useAppSelector((s) => (leadId ? s.leads.entities[leadId] : undefined));
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<Partial<Lead> | null>(null);

  useEffect(() => {
    setDraft(lead ? { ...lead } : null);
  }, [lead]);

  return (
    <Sheet open={!!leadId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {lead && draft && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.name}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <Field label="Name">
                <Input
                  value={draft.name || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </Field>
              <Field label="Company">
                <Input
                  value={draft.company || ""}
                  onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={draft.email || ""}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={draft.phone || ""}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={draft.status || "new"}
                  onValueChange={(v) => setDraft({ ...draft, status: v as LeadStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea
                  value={draft.notes || ""}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  rows={4}
                />
              </Field>
            </div>
            <div className="flex justify-between gap-2 border-t pt-4">
              <Button
                variant="destructive"
                onClick={async () => {
                  await dispatch(deleteLead({ tenantSlug, id: lead.id }));
                  toast.success("Lead deleted");
                  onClose();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={async () => {
                  await dispatch(
                    updateLead({ tenantSlug, id: lead.id, changes: draft }),
                  );
                  toast.success("Saved");
                  onClose();
                }}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LeadFormDialog({
  tenantSlug,
  open,
  onOpenChange,
}: {
  tenantSlug: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<Partial<Lead>>({
    name: "",
    company: "",
    email: "",
    source: "web",
    status: "new",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={draft.name || ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Field label="Company">
            <Input
              value={draft.company || ""}
              onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={draft.email || ""}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </Field>
          <Field label="Source">
            <Select
              value={draft.source}
              onValueChange={(v) => setDraft({ ...draft, source: v as Lead["source"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              await dispatch(createLead({ tenantSlug, input: draft }));
              toast.success("Lead created");
              onOpenChange(false);
              setDraft({ name: "", company: "", email: "", source: "web", status: "new" });
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
