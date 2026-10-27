import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AISummarizeModal } from "./AISummarizeModal";
import type { Communication } from "@/features/communications/communication.types";

export function ConversationHeader({
  tenantSlug,
  leadId,
  firstName,
  lastName,
  phone,
  email,
  messageCount,
  history = [],
}: {
  tenantSlug: string;
  leadId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  messageCount: number;
  history?: Communication[];
}) {
  const navigate = useNavigate();
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);

  const initials = [firstName, lastName]
    .map((part) => part?.trim()?.[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Lead";

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/${tenantSlug}/lead/${leadId}`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to lead"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {fullName}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {phone ?? "No phone on file"}
            {email ? ` · ${email}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setIsSummarizeOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Summarize</span>
            </button>
          )}

          <span className="hidden sm:inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {messageCount} messages
          </span>
        </div>
      </div>

      <AISummarizeModal
        isOpen={isSummarizeOpen}
        onClose={() => setIsSummarizeOpen(false)}
        history={history}
        leadName={fullName}
      />
    </header>
  );
}
