import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { DashboardRole } from "../types/dashboard.types";
import { dashboardApi } from "../apis/dashboard.api";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CACHE_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes stale time
  gcTime: 1000 * 60 * 15, // 15 minutes garbage collection time
  refetchOnWindowFocus: false,
  refetchInterval: false as const,
  retry: 1,
};

export function useDashboardData(role: DashboardRole, currentUser?: any) {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();

  // 1. Critical Top-Fold KPIs & Alerts (fastest response)
  const kpisQuery = useQuery({
    queryKey: ["dashboard", "kpis", role, tenantSlug],
    queryFn: () => dashboardApi.getKpis(role, tenantSlug),
    ...CACHE_CONFIG,
  });

  // 2. Revenue Trend (12M chart)
  const revenueQuery = useQuery({
    queryKey: ["dashboard", "revenue", tenantSlug],
    queryFn: () => dashboardApi.getRevenue(tenantSlug),
    ...CACHE_CONFIG,
  });

  // 3. Pipeline Funnel
  const pipelineQuery = useQuery({
    queryKey: ["dashboard", "pipeline", tenantSlug],
    queryFn: () => dashboardApi.getPipeline(tenantSlug),
    ...CACHE_CONFIG,
  });

  // 4. Leaderboard
  const leaderboardQuery = useQuery({
    queryKey: ["dashboard", "leaderboard", tenantSlug],
    queryFn: () => dashboardApi.getLeaderboard(tenantSlug),
    ...CACHE_CONFIG,
  });

  // Overall loading indicator reflects top-fold KPI availability
  const isLoading = kpisQuery.isLoading;
  const isError = kpisQuery.isError;

  return {
    isLoading,
    isError,
    currentUser,
    // Granular loading flags for progressive hydration
    kpisLoading: kpisQuery.isLoading,
    revenueLoading: revenueQuery.isLoading,
    pipelineLoading: pipelineQuery.isLoading,
    leaderboardLoading: leaderboardQuery.isLoading,
    // Granular analytics data slices
    metrics: kpisQuery.data?.metrics || [],
    alerts: kpisQuery.data?.alerts || [],
    revenueTrend: revenueQuery.data?.revenueTrend || [],
    pipelineFunnel: pipelineQuery.data?.pipelineFunnel || [],
    leaderboard: leaderboardQuery.data?.leaderboard || [],
  };
}
