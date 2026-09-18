import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ROLE_DASHBOARD_CONFIG, normalizeRole } from "@/features/dashboard/configs/dashboard.config";
import type { DashboardRole, DashboardWidgetConfig } from "@/features/dashboard/types/dashboard.types";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WidgetRenderer } from "@/components/dashboard/WidgetRenderer";
import { leadsKeys } from "@/features/leads/keys/leads.keys";
import { dealsKeys } from "@/features/deals/keys/deals.keys";
import { activitiesKeys } from "@/features/activities/keys/activities.keys";
import { invoicesKeys } from "@/features/invoices/keys/invoices.keys";
import { ClientDashboardPage } from "./_app.$tenantSlug.client-dashboard";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUsers";


const COL_SPAN_CLASSES: Record<number, string> = {
  1: "col-span-12 lg:col-span-1",
  2: "col-span-12 lg:col-span-2",
  3: "col-span-12 md:col-span-6 lg:col-span-3",
  4: "col-span-12 md:col-span-6 lg:col-span-4",
  5: "col-span-12 lg:col-span-5",
  6: "col-span-12 lg:col-span-6",
  7: "col-span-12 lg:col-span-7",
  8: "col-span-12 lg:col-span-8",
  9: "col-span-12 lg:col-span-9",
  10: "col-span-12 lg:col-span-10",
  11: "col-span-12 lg:col-span-11",
  12: "col-span-12",
};


function LazyDashboardWidget({
  widget,
  role,
  data,
  isLoading,
  priority = false,
}: {
  widget: DashboardWidgetConfig;
  role: DashboardRole;
  data: any;
  isLoading?: boolean;
  priority?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [shouldRender, setShouldRender] = useState(priority);

  useEffect(() => {
    if (priority) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [priority]);


  const colSpanClass =
    COL_SPAN_CLASSES[widget.colSpan] || "col-span-12";


  return (
    <div
      ref={containerRef}
      className={`${colSpanClass} h-full flex flex-col`}
    >
      {shouldRender ? (
        <WidgetRenderer
          widget={widget}
          role={role}
          data={data}
          isLoading={isLoading}
        />
      ) : (
        <div className="min-h-[220px] w-full rounded-xl border bg-card" />
      )}
    </div>
  );
}


export function DashboardPage() {
  const queryClient = useQueryClient();

  const currentUser = useCurrentUser();

  const activeRole = normalizeRole(currentUser?.user?.role);

  if (currentUser?.user?.role === "CLIENT") {
    return <ClientDashboardPage />;
  }

  const dashboardData = useDashboardData(activeRole);
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
    queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
  }, [queryClient]);


  const widgets = useMemo(() => {
    return (
      ROLE_DASHBOARD_CONFIG[activeRole] ||
      ROLE_DASHBOARD_CONFIG.ADMIN
    );
  }, [activeRole]);


  return (
    <div className="min-h-screen bg-background/95">
      <DashboardHeader
        activeRole={activeRole}
        userName={currentUser?.user?.name || "Team Member"}
        onRefresh={handleRefresh}
        isLoading={dashboardData.isLoading}
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {widgets.map((widget, index) => (
            <LazyDashboardWidget
              key={`${activeRole}-${widget.id}`}
              widget={widget}
              role={activeRole}
              data={dashboardData}
              isLoading={dashboardData.isLoading}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
