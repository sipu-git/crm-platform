import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ConversationHeader({tenantSlug,leadId,firstName,
  lastName,phone,email,messageCount}: {
  tenantSlug: string;
  leadId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  messageCount: number;
}) {
  const navigate = useNavigate();
  const initials = [firstName, lastName].map((part) => part?.trim()?.[0])
    .filter(Boolean).join("").toUpperCase();

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
            {firstName ?? "Lead"} {lastName ?? ""}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {phone ?? "No phone on file"}
            {email ? ` · ${email}` : ""}
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {messageCount} messages
          </span>
        </div>
      </div>
    </header>
  );
}