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
};

