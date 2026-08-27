import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Inbox } from "lucide-react";
import type { LeaderboardRep, WidgetScope } from "@/features/dashboard/dashboard.types";
import { formatCurrency } from "@/features/dashboard/useDashboardData";

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export function LeaderboardWidget({
  reps = [],
  isLoading,
  scope,
  showQuota = true,
}: {
  reps?: LeaderboardRep[];
  isLoading?: boolean;
  scope?: WidgetScope;
  showQuota?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!reps || reps.length === 0) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Rep Leaderboard & Quota</CardTitle>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {scope === "team" ? "Team Standings" : "Org Standings"}
              </span>
            </div>
            <CardDescription className="text-xs">
              Performance rankings & closed revenue
            </CardDescription>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">No leaderboard records found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Team member deal closures will appear here once recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Rep Leaderboard & Quota</CardTitle>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {scope === "team" ? "Team Standings" : "Org Standings"}
            </span>
          </div>
          <CardDescription className="text-xs">
            Rankings ranked by closed revenue & target attainment
          </CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Trophy className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="divide-y divide-border/40 p-0 px-6 pb-2">
        {reps.map((rep) => {
          const initials = rep.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2);
          const isOverQuota = rep.attainmentPercent >= 100;
          const rankDisplay = RANK_BADGES[rep.rank - 1] || `#${rep.rank}`;

          return (
            <div key={rep.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-sm font-bold font-mono">
                    {rankDisplay}
                  </span>

                  <Avatar className="h-8 w-8 border border-border/60">
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{rep.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{rep.role}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-foreground">
                    {formatCurrency(rep.closedRevenue)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {rep.dealsWon} deals · {rep.winRate}% win rate
                  </div>
                </div>
              </div>

              {showQuota && (
                <div className="space-y-1 pl-8">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Quota: {formatCurrency(rep.quota)}</span>
                    <span
                      className={`font-semibold ${
                        isOverQuota
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {rep.attainmentPercent}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(rep.attainmentPercent, 100)}
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
