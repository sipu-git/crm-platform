import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, FileText, Inbox, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentRecord } from "./types";

export const ContinueWidget = React.memo(function ContinueWidget({
  records,
  isLoading,
}: {
  records: RecentRecord[];
  isLoading: boolean;
}) {
  const icons = { lead: Users, deal: BriefcaseBusiness, invoice: FileText };
  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Continue where you left off</CardTitle>
        <CardDescription className="mt-1 text-xs">
          Recently opened records from this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))
        ) : records.length ? (
          records.slice(0, 3).map((record) => {
            const Icon = icons[record.kind];
            return (
              <Link
                key={record.key}
                to={record.href}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{record.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {record.subtitle}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed px-4 py-7 text-center">
            <Inbox className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-xs font-medium">Your recent records will show here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open a lead, deal, or invoice to pick up where you left off.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

