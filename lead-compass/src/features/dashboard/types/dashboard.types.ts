import type { ReactNode } from "react";

export type DashboardRole = "ADMIN" | "MANAGER" | "SALES_REP" | "FINANCE";

export type WidgetScope = "own" | "team" | "org";

export type WidgetType =
  | "kpi_grid"
  | "revenue_chart"
  | "pipeline_funnel"
  | "leaderboard"
  | "activity_feed"
  | "task_queue"
  | "alerts"
  | "quick_actions"
  | "invoices_table"
  | "new_leads"
  | "calendar_upcoming";

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  subtitle?: string;
  colSpan: number; // 1 to 12 (12-column responsive grid)
  rowSpan?: number;
  props: {
    scope: WidgetScope;
    [key: string]: any;
  };
}

export type DashboardConfigMap = Record<DashboardRole, DashboardWidgetConfig[]>;

export interface KpiMetric {
  id: string;
  label: string;
  value: string | number;
  rawNumericValue?: number;
  formattedValue: string;
  changePercent?: number; // e.g. +14.2 or -3.1
  changeType?: "positive" | "negative" | "neutral";
  changePeriod?: string; // e.g. "vs last month" or "vs quota"
  target?: string | number;
  progressPercent?: number; // 0 to 100
  tone?: "default" | "success" | "warning" | "destructive" | "accent";
  iconName: string;
  scope?: WidgetScope;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  value: number;
  conversionRate: number; // e.g. 78%
  color?: string;
}

export interface LeaderboardRep {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  closedRevenue: number;
  quota: number;
  attainmentPercent: number;
  dealsWon: number;
  winRate: number;
  rank: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueLabel: "Overdue" | "Today" | "Tomorrow" | "Upcoming";
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
  relatedTo?: {
    type: "lead" | "deal" | "contact" | "invoice";
    name: string;
    id: string;
  };
  assigneeName?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  actionLabel?: string;
  actionUrl?: string;
  actionType?: string;
  count?: number;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  iconName: string;
  badge?: string;
  actionType: string;
  variant?: "default" | "outline" | "secondary" | "accent";
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  target: number;
  projected?: number;
  collected?: number;
}

