import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { useAuditLogs } from "@/features/audit/hooks/useAuditLogs";

export function AuditPage() {
  const { data: logs = [], isLoading, isError, error, refetch } = useAuditLogs();

  return (
    <div>
      <PageHeader
        title="Audit trail"
        description="Security and compliance history. Available to workspace administrators."
      />
      <div className="p-6">
        {isLoading && !logs.length ? (
          <TableSkeleton />
        ) : !logs.length ? (
          <EmptyState title="No audit records" description="Your audit events will appear here." />
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Entity</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-3 font-medium">{l.action}</td>
                    <td className="px-3 py-3 text-muted-foreground">{l.entityType}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {l.user?.full_name || l.user?.email || "System"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {new Date(l.created_at || l.createdAt || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
