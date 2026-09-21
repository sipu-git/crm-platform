// features/leads/leads.page.tsx
import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { LEAD_STATUSES, LEAD_STATUS_COLORS } from "@/features/leads/types/lead.types";
import { useNavigate, useParams } from "react-router-dom";
import { useLeads, useSearchLeads } from "@/features/leads/hooks/useLeads";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import SearchLead from "@/features/leads/components/SearchLead";
import { AddLeadDialog } from "@/features/leads/components/AddLeadDialog";

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function LeadsPage() {
  const { tenantSlug = "" } = useParams();
  const [q, setQ] = useState("");
  const debouncedQuery = useDebouncedValue(q.trim(), 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthPayload()
  const isSalesRep = auth?.user.role === "SALES_REP";

  const isSearching = debouncedQuery.length > 0;

  const { data: allLeads = [], isLoading: loadingAll } = useLeads();
  const { data: searchResults = [], isFetching: searching } = useSearchLeads(debouncedQuery);

  const sourceLeads = isSearching ? searchResults : allLeads;
  const loading = isSearching ? searching : loadingAll;

  const filtered = useMemo(() => {
    if (statusFilter === "all") return sourceLeads;
    return sourceLeads.filter((l) => l.status === statusFilter);
  }, [sourceLeads, statusFilter]);

  return (
    <div>
      <PageHeader
        title={isSalesRep ? "My assigned leads" : "Leads"}
        description={isSalesRep ? "Prospects currently assigned to you." : "Prospects and inbound contacts across your workspace."}
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
            <SearchLead value={q} onValueChange={setQ} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 bg-card">
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

        {loading && filtered.length === 0 && <TableSkeleton />}

        {!loading && filtered.length === 0 && (
          <EmptyState
            title={isSearching ? `No leads match "${debouncedQuery}"` : "No leads found"}
            description={
              isSearching
                ? "Try a different search term, or clear the search to see all leads."
                : "Try clearing filters or add a new lead to get started."
            }
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
                      <td className="px-3 py-2 font-medium">
                        {l.contact?.first_name} {l.contact?.last_name}
                      </td>
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
    </div>
  );
}
