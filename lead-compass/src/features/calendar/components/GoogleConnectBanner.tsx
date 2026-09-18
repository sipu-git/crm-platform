import { useState } from "react";
import { useCalendarStatus } from "../hooks/useCalendar";
import { calendarApi } from "../apis/calendar.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ExternalLink, RefreshCw, Video } from "lucide-react";
import { toast } from "sonner";

export function GoogleConnectBanner() {
  const { data: status, isLoading, refetch } = useCalendarStatus();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { url } = await calendarApi.getConnectUrl("/calendar");
      window.location.href = url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate Google connection link.");
      setConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-muted/40 animate-pulse">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/10 shadow-sm">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Google Calendar Integration</h3>
              {status?.connected ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 gap-1 text-[11px]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px]">Not Connected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status?.connected && status.email
                ? `Active account: ${status.email}. Google Meet and Calendar sync are active.`
                : "Connect your Google account to sync events, schedule meetings, and generate Google Meet video links."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {status?.connected ? (
            <>
              <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh status">
                <RefreshCw className="h-4 w-4 mr-1.5" /> Sync Status
              </Button>
              <Button variant="secondary" size="sm" onClick={handleConnect} disabled={connecting}>
                <ExternalLink className="h-4 w-4 mr-1.5" /> Reconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={connecting} className="w-full sm:w-auto gap-2">
              <Video className="h-4 w-4" />
              {connecting ? "Redirecting..." : "Connect Google Account"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

