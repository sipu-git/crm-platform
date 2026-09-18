import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { DashboardRole } from "../types/dashboard.types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUsers";
import { dashboardApi } from "../apis/dashboard.api";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function useDashboardData(role: DashboardRole) {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();
  const currentUser = useCurrentUser();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-overview", role, tenantSlug],
    queryFn: () => dashboardApi.getOverview(role, tenantSlug),
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection time
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
  });

  return {
    isLoading,
    isError,
    currentUser,
    metrics: data?.metrics || [],
    revenueTrend: data?.revenueTrend || [],
    pipelineFunnel: data?.pipelineFunnel || [],
    leaderboard: data?.leaderboard || [],
    taskQueue: data?.taskQueue || [],
    alerts: data?.alerts || [],
    activities: data?.activities || [],
    invoices: data?.invoices || [],
    leads: data?.leads || [],
  };
}
