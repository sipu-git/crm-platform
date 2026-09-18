import { lazy, Suspense } from "react";

import type {
  DashboardWidgetConfig,
  DashboardRole,
} from "@/features/dashboard/types/dashboard.types";

/* Lazy-loaded widgets */

const KpiGridWidget = lazy(() =>
  import("./widgets/KpiGridWidget").then((module) => ({
    default: module.KpiGridWidget,
  }))
);

const RevenueChartWidget = lazy(() =>
  import("./widgets/RevenueChartWidget").then((module) => ({
    default: module.RevenueChartWidget,
  }))
);

const PipelineFunnelWidget = lazy(() =>
  import("./widgets/PipelineFunnelWidget").then((module) => ({
    default: module.PipelineFunnelWidget,
  }))
);

const LeaderboardWidget = lazy(() =>
  import("./widgets/LeaderboardWidget").then((module) => ({
    default: module.LeaderboardWidget,
  }))
);

const ActivityFeedWidget = lazy(() =>
  import("./widgets/ActivityFeedWidget").then((module) => ({
    default: module.ActivityFeedWidget,
  }))
);

const TaskQueueWidget = lazy(() =>
  import("./widgets/TaskQueueWidget").then((module) => ({
    default: module.TaskQueueWidget,
  }))
);

const AlertBannerWidget = lazy(() =>
  import("./widgets/AlertBannerWidget").then((module) => ({
    default: module.AlertBannerWidget,
  }))
);

const QuickActionGridWidget = lazy(() =>
  import("./widgets/QuickActionGridWidget").then((module) => ({
    default: module.QuickActionGridWidget,
  }))
);

const InvoicesTableWidget = lazy(() =>
  import("./widgets/InvoicesTableWidget").then((module) => ({
    default: module.InvoicesTableWidget,
  }))
);

const NewLeadsWidget = lazy(() =>
  import("./widgets/NewLeadsWidget").then((module) => ({
    default: module.NewLeadsWidget,
  }))
);

const CalendarUpcomingWidget = lazy(() =>
  import("./widgets/CalendarUpcomingWidget").then((module) => ({
    default: module.CalendarUpcomingWidget,
  }))
);

function WidgetLoadingSkeleton() {
  return (
    <div className="min-h-[220px] w-full rounded-xl border bg-card animate-pulse" />
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
    <Suspense fallback={<WidgetLoadingSkeleton />}>
      {renderWidgetContent()}
    </Suspense>
  );
}