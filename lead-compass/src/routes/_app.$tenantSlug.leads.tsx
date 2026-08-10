// features/leads/leads.page.tsx
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { viewLeads } from "@/features/leads/service1/slice";
import { LEAD_STATUSES, LEAD_STATUS_COLORS } from "@/features/leads/service1/lead.types";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { useNavigate, useParams } from "react-router-dom";

export function LeadsPage() {
  const { tenantSlug = "" } = useParams();
  const dispatch = useAppDispatch();
  const { leads, loading } = useAppSelector((state) => state.leads);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(viewLeads());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (query && !(l.contact?.first_name.toLowerCase().includes(query) ||
        l.company_name.toLowerCase().includes(query) ||
        (l.email ?? "").toLowerCase().includes(query)
      )
      )
        return false;
      return true;
    });
  }, [leads, q, statusFilter]);

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
          <div className="relative min-w-55 flex-1 bg-background">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company"
              className="h-9 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 bg-background">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && leads.length === 0 && <TableSkeleton />}
        {!loading && filtered.length === 0 && (
          <EmptyState
            title="No leads found"
            description="Try clearing filters or add a new lead to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New lead
              </Button>
            }
          />
        )}
        {filtered.length > 0 && (
          <div className="overflow-hidden rounded-md border bg-card">
            <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">Designation</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">Project</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((l) => (
                    <tr
                      key={l.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => navigate(`/${tenantSlug}/lead/${l.id}`)}
                    >
                      <td className="px-3 py-2 font-medium">{l.contact?.first_name} {l.contact?.last_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.company_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.contact?.designation}</td>
                      <td className="px-3 py-2 capitalize text-muted-foreground">
                        {l.source.toLowerCase()}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                          style={{
                            backgroundColor: `${LEAD_STATUS_COLORS[l.status]}22`,
                            color: LEAD_STATUS_COLORS[l.status],
                          }}
                        >
                          {l.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{l.contact?.email}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.contact?.phone}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.project_name}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddLeadDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* {openId && (
        <EditLeadDialog
          leadId={openId}
          open={!!openId}
          onOpenChange={(v) => setOpenId(v ? openId : null)}
        />
      )} */}
    </div>
  );
}