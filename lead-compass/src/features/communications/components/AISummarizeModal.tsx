import React, { useEffect } from "react";
import { Sparkles, Loader2, X, AlertTriangle, CheckCircle2, Copy, Check, ListTodo } from "lucide-react";
import { useSummarizeCommunicationsMutation } from "@/features/ai/hooks/useAi";
import type { Communication } from "@/features/communications/communication.types";
import { toast } from "sonner";

interface AISummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Communication[];
  leadName?: string;
}

export const AISummarizeModal: React.FC<AISummarizeModalProps> = ({
  isOpen,
  onClose,
  history,
  leadName = "Client",
}) => {
  const [copied, setCopied] = React.useState(false);
  const summarizeMutation = useSummarizeCommunicationsMutation();

  useEffect(() => {
    if (isOpen && history.length > 0 && !summarizeMutation.data && !summarizeMutation.isPending) {
      const messages = history
        .filter((h) => Boolean(h.body))
        .map((h) => ({
          sender: h.direction === "OUTBOUND" ? "Sales Rep" : leadName,
          text: h.body || "",
          date: (h as any).created_at || (h as any).createdAt,
        }));

      if (messages.length > 0) {
        summarizeMutation.mutate({ messages });
      }
    }
  }, [isOpen, history, leadName]);

  if (!isOpen) return null;

  const result = summarizeMutation.data;

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `Conversation Summary for ${leadName}:`,
      result.summary,
      "",
      result.objections.length > 0 ? `Objections:\n- ${result.objections.join("\n- ")}\n` : "",
      result.action_items.length > 0
        ? `Action Items:\n${result.action_items.map((a) => `[${a.priority}] ${a.title}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-600 border-rose-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "LOW":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Thread Summary</h3>
              <p className="text-xs text-muted-foreground">Generated with Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {summarizeMutation.isPending && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium text-foreground">Analyzing conversation history…</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Extracting key discussion points, customer objections, and prioritized action items.
            </p>
          </div>
        )}

        {summarizeMutation.isError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center space-y-2">
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Failed to generate conversation summary.
            </p>
            <button
              onClick={() => {
                const messages = history
                  .filter((h) => Boolean(h.body))
                  .map((h) => ({
                    sender: h.direction === "OUTBOUND" ? "Sales Rep" : leadName,
                    text: h.body || "",
                  }));
                summarizeMutation.mutate({ messages });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-4 text-xs">
            {/* Executive Summary */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                Discussion Summary
              </span>
              <p className="rounded-xl bg-muted/50 p-3.5 leading-relaxed text-foreground border border-border/60">
                {result.summary}
              </p>
            </div>

            {/* Objections */}
            {result.objections.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Detected Objections & Concerns</span>
                </div>
                <ul className="space-y-1 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                  {result.objections.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {result.action_items.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ListTodo className="h-3.5 w-3.5 text-primary" />
                  <span>Recommended Action Items</span>
                </div>
                <div className="space-y-1.5">
                  {result.action_items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-foreground font-medium">{item.title}</span>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Summary"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
