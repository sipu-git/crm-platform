import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Activity as ActivityIcon,
  Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WidgetScope } from "@/features/dashboard/dashboard.types";

interface ActivityItem {
  id: string;
  description: string;
  type?: string;
  created_at?: string;
  createdAt?: string;
  user?: { full_name?: string; email?: string };
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <PhoneCall className="h-3.5 w-3.5 text-blue-500" />,
  email: <Mail className="h-3.5 w-3.5 text-purple-500" />,
  meeting: <Calendar className="h-3.5 w-3.5 text-amber-500" />,
  deal_won: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  invoice: <FileText className="h-3.5 w-3.5 text-indigo-500" />,
  default: <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />,
};

export function ActivityFeedWidget({
  activities = [],
  isLoading,
  scope,
  limit = 8,
}: {
  activities?: ActivityItem[];
  isLoading?: boolean;
  scope?: WidgetScope;
  limit?: number;
}) {
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Activity Stream</CardTitle>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {scope === "own" ? "My Activity" : scope === "team" ? "Team Feed" : "Org Stream"}
              </span>
            </div>
            <CardDescription className="text-xs">Live feed of interactions & notes</CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <ActivityIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No recent activity logged</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Logged calls, sent emails, and deal milestones will appear in this feed.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, limit);

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Activity Stream</CardTitle>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {scope === "own" ? "My Activity" : scope === "team" ? "Team Feed" : "Org Stream"}
            </span>
          </div>
          <CardDescription className="text-xs">
            Real-time feed of calls, emails, and milestones
          </CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
          <ActivityIcon className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="p-0 px-6 pb-4">
        <div className="relative pl-6 after:absolute after:inset-y-2 after:left-2.5 after:w-[1px] after:bg-border/60">
          <div className="space-y-4">
            {displayActivities.map((act) => {
              const dateStr = act.created_at || act.createdAt || new Date().toISOString();
              let timeAgo = "recently";
              try {
                timeAgo = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
              } catch {
                timeAgo = "recently";
              }
              const icon = TYPE_ICONS[act.type || "default"] || TYPE_ICONS.default;

              return (
                <div key={act.id} className="relative flex items-start gap-3 text-xs group">
                  <span className="absolute -left-6 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-card border border-border shadow-xs">
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-foreground font-medium leading-relaxed group-hover:text-primary transition-colors">
                      {act.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
