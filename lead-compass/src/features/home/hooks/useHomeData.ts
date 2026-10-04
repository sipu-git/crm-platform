import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { DashboardRole } from "@/features/dashboard/types/dashboard.types";
import { dashboardApi } from "@/features/dashboard/apis/dashboard.api";
import type { HomeActivityItem, HomeLeadRecord } from "@/features/home/types";

const HOME_CACHE = {
  staleTime: 1000 * 60,
  gcTime: 1000 * 60 * 15,
  refetchOnWindowFocus: false,
  retry: 1,
};

/** Daily work data used by Home, kept out of the analytics Dashboard queries. */
export function useHomeData(role: DashboardRole) {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();

  const tasks = useQuery({
    queryKey: ["dashboard", "tasks", role, tenantSlug],
    queryFn: () => dashboardApi.getTasks(role, tenantSlug),
    ...HOME_CACHE,
  });

  const recent = useQuery({
    queryKey: ["dashboard", "recent", role, tenantSlug],
    queryFn: () => dashboardApi.getRecent(role, tenantSlug),
    ...HOME_CACHE,
  });

  return {
    isLoading: tasks.isLoading || recent.isLoading,
    tasks: tasks.data?.taskQueue ?? [],
    activities: (recent.data?.activities ?? []) as HomeActivityItem[],
    invoices: recent.data?.invoices ?? [],
    leads: (recent.data?.leads ?? []) as HomeLeadRecord[],
  };
}
