import React, { useState } from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { Workflow, Sparkles, RefreshCw, CheckCircle2, Clock, AlertCircle, PlayCircle, Eye, ShieldCheck, UserCheck } from "lucide-react";
import { useAutomationRunsQuery } from "@/features/ai/hooks/useAi";

const CORE_WORKFLOWS = [
  {
    id: "LEAD_ASSIGNMENT",
    name: "AI Lead Auto-Assignment",
    trigger: "lead.created",
    desc: "Evaluates new lead workload and automatically assigns to the least loaded qualified sales rep.",
    active: true,
    icon: UserCheck,
  },
  {
    id: "CLIENT_CONVERSION",
    name: "AI Client Conversion on Deal Won",
    trigger: "deal.won",
    desc: "Inspects closed-won deals and converts qualified lead data to verified client records.",
    active: true,
    icon: ShieldCheck,
  },
];

export default function AutomationPanel() {
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const { data: runs = [], isLoading, isRefetching, refetch } = useAutomationRunsQuery(50);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge color="green">Succeeded</Badge>;
      case "RUNNING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30 animate-pulse"><PlayCircle className="h-3 w-3" /> Running</span>;
      case "FAILED":
        return <Badge color="red">Failed</Badge>;
      case "SKIPPED":
        return <Badge color="slate">Skipped</Badge>;
      default:
        return <Badge color="slate">{status}</Badge>;
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Active AI Workflows */}
      <SettingsCard
        title="AI Event Workflows"
        desc="Autonomous workflows powered by LangGraph AI agents and CRM event listeners."
      >
        <div className="space-y-3">
          {CORE_WORKFLOWS.map((w) => {
            const Icon = w.icon;
            return (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{w.name}</p>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {w.trigger}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">{w.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={w.active ? "green" : "slate"}>{w.active ? "Active" : "Paused"}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {/* Live AI Automation Run History */}
      <SettingsCard
        title="Live Automation History"
        desc="Real-time execution log of event-driven AI workflow runs across this workspace."
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
        }
      >
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading automation history…
          </div>
        ) : runs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No automation runs recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Automations run automatically when events occur, such as creating a new lead or marking a deal as won.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Workflow</th>
                  <th className="py-2.5 px-3 font-medium">Trigger Event</th>
                  <th className="py-2.5 px-3 font-medium">Entity ID</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Started At</th>
                  <th className="py-2.5 px-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>{run.workflow.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                      {run.event_type}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground max-w-[140px] truncate" title={run.entity_id}>
                      {run.entity_id}
                    </td>
                    <td className="py-3 px-3">
                      {getStatusBadge(run.status)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDate(run.created_at)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRun(run)}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View payload & result"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      {/* Detail Dialog for Run Result */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Automation Run Detail
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedRun.workflow}</p>
              </div>
              <div>{getStatusBadge(selectedRun.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Entity ID:</span>
                <p className="font-mono text-foreground break-all">{selectedRun.entity_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trigger Event:</span>
                <p className="font-mono text-foreground">{selectedRun.event_type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Started:</span>
                <p className="text-foreground">{formatDate(selectedRun.started_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Finished:</span>
                <p className="text-foreground">{formatDate(selectedRun.finished_at)}</p>
              </div>
            </div>

            {selectedRun.error_message && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
                <span className="font-semibold">Error:</span> {selectedRun.error_message}
              </div>
            )}

            {selectedRun.result && (
              <div>
                <span className="text-xs font-semibold text-foreground">Execution Outcome / Result:</span>
                <pre className="mt-1.5 p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground overflow-x-auto max-h-48 border border-border">
                  {JSON.stringify(selectedRun.result, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
