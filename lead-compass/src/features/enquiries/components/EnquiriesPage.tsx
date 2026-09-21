import React, { lazy, Suspense, useMemo } from "react";
import { EnquiriesPageProps } from "@/features/enquiries/utils/enquiries.constants";
import { EnquiriesCharts } from "@/features/enquiries/components/EnquiriesCharts";
import { EnquiriesToolbar } from "@/features/enquiries/components/EnquiriesToolbar";
import { EnquiriesTable } from "@/features/enquiries/components/EnquiriesTable";
import { EnquiriesDeleteDialog } from "@/features/enquiries/components/EnquiriesDeleteDialog";
import { PageHeader } from "@/components/ui-kit";

const KpiGridWidgets = lazy(() =>
  import("@/features/dashboard/components/widgets/KpiGridWidget").then((module) => ({
    default: module.KpiGridWidget,
  }))
);

export function EnquiriesPage(data: EnquiriesPageProps) {
  const visible = useMemo(() => {
    const q = data.query.trim().toLowerCase();
    return data.enquiries.filter((row) => {
      const matchesStatus = data.status === "ALL" || row.enquiryStatus === data.status;
      const matchesSearch =
        !q ||
        [row.first_name, row.last_name, row.email, row.company_name, row.source]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data.enquiries, data.query, data.status]);

  const total = data.enquiries.length;

  if (data.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <span className="mx-auto mb-3 h-8 w-8 text-destructive">!</span>
          <p className="text-sm font-medium text-destructive">Unable to load enquiries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer enquiries"
        description="Review incoming demand signals and route the right prospects for approval."
      />
      <div className="space-y-4 p-6">
        <Suspense
          fallback={
            <div className="h-32 animate-pulse rounded-2xl border bg-muted/40" />
          }
        >
          <KpiGridWidgets
            metrics={data.kpiMetrics}
            isLoading={data.isLoading}
          />
        </Suspense>
        <EnquiriesCharts statusChartData={data.statusChartData} trendData={data.trendData} />

        <section className="rounded-2xl border bg-card shadow-sm">
          <EnquiriesToolbar
            query={data.query}
            status={data.status}
            visibleCount={visible.length}
            totalCount={total}
            onQueryChange={data.onSearchChange}
            onStatusChange={data.onStatusChange}
          />

          <EnquiriesTable
            enquiries={visible}
            isLoading={data.isLoading}
            isPending={data.isPending}
            onApprove={data.onApprove}
            onReject={data.onReject}
            onDeleteRequest={data.onDeleteRequest}
          />
        </section>
      </div>

      <EnquiriesDeleteDialog
        open={!!data.pendingDeleteId}
        onOpenChange={(open) => data.onDeleteDialogOpenChange(open)}
        onConfirm={data.onDeleteConfirm}
      />
    </div>
  );
}
