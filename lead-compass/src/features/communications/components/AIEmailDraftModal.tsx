import React, { useState } from "react";
import { Sparkles, Loader2, X, Send, Copy, Check, RotateCw } from "lucide-react";
import { useGenerateEmailDraftMutation } from "@/features/ai/hooks/useAi";
import { toast } from "sonner";

interface AIEmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  companyName: string;
  onApplyDraft: (subject: string, body: string) => void;
}

const PRESET_PURPOSES = [
  "Follow up on initial consultation",
  "Product demonstration invitation",
  "Proposal review and next steps",
  "Contract and pricing check-in",
  "Project scope clarification",
];

export const AIEmailDraftModal: React.FC<AIEmailDraftModalProps> = ({
  isOpen,
  onClose,
  clientName,
  companyName,
  onApplyDraft,
}) => {
  const [purpose, setPurpose] = useState(PRESET_PURPOSES[0]);
  const [tone, setTone] = useState<"professional" | "persuasive" | "friendly">("professional");
  const [customNote, setCustomNote] = useState("");
  const [copied, setCopied] = useState(false);

  const draftMutation = useGenerateEmailDraftMutation();

  if (!isOpen) return null;

  const handleGenerate = () => {
    const fullPurpose = customNote.trim() ? `${purpose}: ${customNote.trim()}` : purpose;
    draftMutation.mutate({
      clientName: clientName || "Client",
      companyName: companyName || "Prospective Client",
      purpose: fullPurpose,
      tone,
    });
  };

  const draft = draftMutation.data;

  const handleApply = () => {
    if (!draft) return;
    onApplyDraft(draft.subject, draft.body);
    toast.success("Draft inserted into message form");
    onClose();
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Email Assistant</h3>
              <p className="text-xs text-muted-foreground">Draft tailored sales messages with Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Parameters */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Purpose / Scenario</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PRESET_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Tone of Voice</label>
            <div className="grid grid-cols-3 gap-2">
              {(["professional", "persuasive", "friendly"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-lg py-1.5 px-3 text-xs capitalize font-medium border transition-colors ${
                    tone === t
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Additional Context (Optional)</label>
            <input
              type="text"
              placeholder="e.g. mention the special 15% discount valid until Friday..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={draftMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 px-4 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all active:scale-[0.99]"
            >
              {draftMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Drafting Email with Gemini AI…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{draft ? "Regenerate Draft" : "Generate Email Draft"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Result */}
        {draft && (
          <div className="space-y-3 pt-3 border-t border-border text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground text-[11px] uppercase">Subject Line</label>
              <div className="rounded-lg bg-muted/60 p-2.5 font-medium text-foreground border border-border">
                {draft.subject}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground text-[11px] uppercase">Email Body</label>
              <div className="rounded-lg bg-muted/60 p-3 whitespace-pre-wrap text-foreground max-h-48 overflow-y-auto leading-relaxed border border-border">
                {draft.body}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Insert Into Composer</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
