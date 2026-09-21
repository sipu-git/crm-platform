import { AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GmailAccountStatus } from "@/features/communications/communication.types";

export function GmailConnectBanner({
  gmailStatus,
  connecting,
  onConnect,
}: {
  gmailStatus?: GmailAccountStatus | null;
  connecting: boolean;
  onConnect: () => void;
}) {
  if (gmailStatus?.connected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium text-foreground">Sending via Gmail:</span>
          <span className="text-muted-foreground font-mono truncate max-w-[180px] sm:max-w-none">
            {gmailStatus.email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Gmail Account Not Connected</span>
      </div>
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Connect your Google Gmail account to send emails directly to leads through the Gmail API.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={connecting}
        className="w-full text-xs gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15"
        onClick={onConnect}
      >
        <Mail className="h-3.5 w-3.5" />
        {connecting ? "Redirecting…" : "Connect Gmail Account"}
      </Button>
    </div>
  );
}