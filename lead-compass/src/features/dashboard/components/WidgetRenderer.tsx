import { lazy, Suspense } from "react";

import type {
  DashboardWidgetConfig,
  DashboardRole,
} from "@/features/dashboard/types/dashboard.types";
/* Eagerly-loaded above-the-fold widgets */
import { KpiGridWidget } from "./widgets/KpiGridWidget";
import { RevenueChartWidget } from "./widgets/RevenueChartWidget";

/* Lazy-loaded below-the-fold widgets */
const PipelineFunnelWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/PipelineFunnelWidget").then((module) => ({
    default: module.PipelineFunnelWidget,
  }))
);

const LeaderboardWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/LeaderboardWidget").then((module) => ({
    default: module.LeaderboardWidget,
  }))
);

const ActivityFeedWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/ActivityFeedWidget").then((module) => ({
    default: module.ActivityFeedWidget,
  }))
);

const TaskQueueWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/TaskQueueWidget").then((module) => ({
    default: module.TaskQueueWidget,
  }))
);

const AlertBannerWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/AlertBannerWidget").then((module) => ({
    default: module.AlertBannerWidget,
  }))
);

const QuickActionGridWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/QuickActionGridWidget").then((module) => ({
    default: module.QuickActionGridWidget,
  }))
);

const InvoicesTableWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/InvoicesTableWidget").then((module) => ({
    default: module.InvoicesTableWidget,
  }))
);

const NewLeadsWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/NewLeadsWidget").then((module) => ({
    default: module.NewLeadsWidget,
  }))
);

const CalendarUpcomingWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/CalendarUpcomingWidget").then((module) => ({
    default: module.CalendarUpcomingWidget,
  }))
);

const WIDGET_MIN_HEIGHTS: Record<string, string> = {
  kpi_grid: "min-h-[140px]",
  revenue_chart: "min-h-[380px]",
  pipeline_funnel: "min-h-[380px]",
  leaderboard: "min-h-[350px]",
  calendar_upcoming: "min-h-[350px]",
  task_queue: "min-h-[350px]",
  activity_feed: "min-h-[350px]",
  invoices_table: "min-h-[350px]",
  alerts: "min-h-[260px]",
  quick_actions: "min-h-[180px]",
  new_leads: "min-h-[320px]",
};

function WidgetLoadingSkeleton({ type }: { type?: string }) {
  const minHeightClass = (type && WIDGET_MIN_HEIGHTS[type]) || "min-h-[260px]";
  return (
    <div className={`${minHeightClass} w-full rounded-xl border bg-card/60 animate-pulse`} />
  );
}

export function WidgetRenderer({
  widget,
  role,
  data,
  isLoading,
}: {
  widget: DashboardWidgetConfig;
  role: DashboardRole;
  data: any;
  isLoading?: boolean;
}) {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case "kpi_grid":
        return (
          <KpiGridWidget
            metrics={data.metrics}
            isLoading={isLoading}
            scope={widget.props.scope}
          />
        );

      case "revenue_chart":
        return (
          <RevenueChartWidget
            data={data.revenueTrend}
            isLoading={isLoading}
            scope={widget.props.scope}
            title={widget.title}
            subtitle={widget.subtitle}
            showTargetLine={widget.props.showTargetLine}
            mode={widget.props.mode}
          />
        );

      case "pipeline_funnel":
        return (
          <PipelineFunnelWidget
            stages={data.pipelineFunnel}
            isLoading={isLoading}
            scope={widget.props.scope}
          />
        );

      case "leaderboard":
        return (
          <LeaderboardWidget
            reps={data.leaderboard}
            isLoading={isLoading}
            scope={widget.props.scope}
            showQuota={widget.props.showQuota}
          />
        );

      case "activity_feed":
        return (
          <ActivityFeedWidget
            activities={data.activities}
            isLoading={isLoading}
            scope={widget.props.scope}
            limit={widget.props.limit}
          />
        );

      case "task_queue":
        return (
          <TaskQueueWidget
            tasks={data.taskQueue}
            isLoading={isLoading}
            scope={widget.props.scope}
            showAssignee={widget.props.showAssignee}
          />
        );

      case "alerts":
        return (
          <AlertBannerWidget
            alerts={data.alerts}
            isLoading={isLoading}
            scope={widget.props.scope}
            title={widget.title}
            subtitle={widget.subtitle}
          />
        );

      case "quick_actions":
        return (
          <QuickActionGridWidget
            role={role}
            scope={widget.props.scope}
            title={widget.title}
            subtitle={widget.subtitle}
          />
        );

      case "invoices_table":
        return (
          <InvoicesTableWidget
            invoices={data.invoices}
            isLoading={isLoading}
            scope={widget.props.scope}
            title={widget.title}
            subtitle={widget.subtitle}
            limit={widget.props.limit}
          />
        );

      case "new_leads":
        return (
          <NewLeadsWidget
            leads={data.leads}
            isLoading={isLoading}
            scope={widget.props.scope}
            title={widget.title}
            subtitle={widget.subtitle}
            limit={widget.props.limit}
          />
        );

      case "calendar_upcoming":
        return <CalendarUpcomingWidget />;

      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<WidgetLoadingSkeleton type={widget.type} />}>
      {renderWidgetContent()}
    </Suspense>
  );
}