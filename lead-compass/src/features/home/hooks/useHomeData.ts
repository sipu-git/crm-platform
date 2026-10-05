import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { DashboardRole } from "@/features/dashboard/types/dashboard.types";
import { dashboardApi } from "@/features/dashboard/apis/dashboard.api";
import type { HomeActivityItem, HomeLeadRecord } from "@/features/home/types";
import type { TaskItem } from "@/features/dashboard/types/dashboard.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";

const EMPTY_TASKS: TaskItem[] = [];
const EMPTY_ACTIVITIES: HomeActivityItem[] = [];
const EMPTY_INVOICES: Invoice[] = [];
const EMPTY_LEADS: HomeLeadRecord[] = [];

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
    tasks: tasks.data?.taskQueue ?? EMPTY_TASKS,
    activities: (recent.data?.activities ?? EMPTY_ACTIVITIES) as HomeActivityItem[],
    invoices: recent.data?.invoices ?? EMPTY_INVOICES,
    leads: (recent.data?.leads ?? EMPTY_LEADS) as HomeLeadRecord[],
  };
}
