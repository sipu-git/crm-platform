import React, { lazy, Suspense } from "react";
import type { WidgetScope } from "@/features/dashboard/types/dashboard.types";
import type { HomeActivityItem } from "@/features/home/types";

const ActivityFeedWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/ActivityFeedWidget").then((module) => ({
    default: module.ActivityFeedWidget,
  })),
);

export const RecentActivityWidget = React.memo(function RecentActivityWidget({
  activities,
  isLoading,
  scope,
}: {
  activities: HomeActivityItem[];
  isLoading: boolean;
  scope: WidgetScope;
}) {
  return (
    <Suspense fallback={<div className="min-h-52 animate-pulse rounded-xl border bg-card/60" />}>
      <ActivityFeedWidget
        activities={activities}
        isLoading={isLoading}
        scope={scope}
        limit={6}
        title="Recent activity"
      />
    </Suspense>
  );
});

