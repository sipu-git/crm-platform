import { api } from "@/api/client";
import type { DashboardRole, KpiMetric, FunnelStage, LeaderboardRep, TaskItem, AlertItem, RevenueDataPoint } from "../types/dashboard.types";

type Envelope<T> = { data: T };
const payload = <T,>(response: { data: Envelope<T> }) => response.data.data;

export interface DashboardOverviewResponse {
  metrics: KpiMetric[];
  revenueTrend: RevenueDataPoint[];
  pipelineFunnel: FunnelStage[];
  leaderboard: LeaderboardRep[];
  taskQueue: TaskItem[];
  alerts: AlertItem[];
  activities: any[];
  invoices: any[];
  leads: any[];
}

export const dashboardApi = {
  async getOverview(role?: DashboardRole, tenantSlug?: string): Promise<DashboardOverviewResponse> {
    return payload(
      await api.get<Envelope<DashboardOverviewResponse>>("/dashboard/overview", {
        params: { role, tenantSlug },
      })
    );
  },

  async getKpis(role?: DashboardRole, tenantSlug?: string): Promise<{ metrics: KpiMetric[]; alerts: AlertItem[] }> {
    return payload(
      await api.get<Envelope<{ metrics: KpiMetric[]; alerts: AlertItem[] }>>("/dashboard/kpis", {
        params: { role, tenantSlug },
      })
    );
  },

  async getRevenue(tenantSlug?: string): Promise<{ revenueTrend: RevenueDataPoint[] }> {
    return payload(
      await api.get<Envelope<{ revenueTrend: RevenueDataPoint[] }>>("/dashboard/revenue", {
        params: { tenantSlug },
      })
    );
  },

  async getPipeline(tenantSlug?: string): Promise<{ pipelineFunnel: FunnelStage[] }> {
    return payload(
      await api.get<Envelope<{ pipelineFunnel: FunnelStage[] }>>("/dashboard/pipeline", {
        params: { tenantSlug },
      })
    );
  },

  async getLeaderboard(tenantSlug?: string): Promise<{ leaderboard: LeaderboardRep[] }> {
    return payload(
      await api.get<Envelope<{ leaderboard: LeaderboardRep[] }>>("/dashboard/leaderboard", {
        params: { tenantSlug },
      })
    );
  },

  async getTasks(role?: DashboardRole, tenantSlug?: string): Promise<{ taskQueue: TaskItem[] }> {
    return payload(
      await api.get<Envelope<{ taskQueue: TaskItem[] }>>("/dashboard/tasks", {
        params: { role, tenantSlug },
      })
    );
  },

  async getRecent(role?: DashboardRole, tenantSlug?: string): Promise<{ activities: any[]; invoices: any[]; leads: any[] }> {
    return payload(
      await api.get<Envelope<{ activities: any[]; invoices: any[]; leads: any[] }>>("/dashboard/recent", {
        params: { role, tenantSlug },
      })
    );
  },
};
