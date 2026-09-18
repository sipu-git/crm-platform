import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowRight, Inbox } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { WidgetScope } from "@/features/dashboard/types/dashboard.types";

interface LeadItem {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  source?: string;
  created_at?: string;
}

export function NewLeadsWidget({leads = [],isLoading,scope,title = "Assigned Inbound Leads",
  subtitle = "Prospective accounts waiting for initial outreach",limit = 5,
}: {
  leads?: LeadItem[];
  isLoading?: boolean;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const navigate = useNavigate();
  const { tenantSlug = "" } = useParams();

  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No leads assigned</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Newly created or assigned inbound accounts will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayLeads = leads.slice(0, limit);

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {displayLeads.length} Leads
            </span>
          </div>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Sparkles className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="divide-y divide-border/40 p-0 px-6 pb-2">
        {displayLeads.map((lead) => {
          const fullName =
            lead.name ||
            [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
            "Prospective Lead";
          const company = lead.company_name || "Enterprise Account";
          const initials = fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2);
          let timeAgo = "recently";
          if (lead.created_at) {
            try {
              timeAgo = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true });
            } catch {
              timeAgo = "recently";
            }
          }

          return (
            <div
              key={lead.id}
              className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 border border-border/60">
                  <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {fullName}
                    </span>
                    {lead.source && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                        {lead.source}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {company} · {timeAgo}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/${tenantSlug}/lead/${lead.id}`)}
                  className="h-7 w-7 p-0"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
