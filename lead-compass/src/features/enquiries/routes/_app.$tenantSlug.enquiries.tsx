import { useMemo, useState } from "react";
import type { EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import {useEnquiries,useApproveEnquiry,useRejectEnquiry,useDeleteEnquiry} from "@/features/enquiries/hooks/useEnquiries";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { toast } from "sonner";
import { STATUS_META, STATUS_ORDER } from "@/features/enquiries/utils/enquiries.constants";
import type { KpiMetric } from "@/features/dashboard/types/dashboard.types";
import { EnquiriesPage } from "@/features/enquiries/components/EnquiriesPage";

function countInWindow(
  rows: { created_at: string; enquiryStatus: EnquiryStatus }[],
  daysAgoStart: number,
  daysAgoEnd: number,
  status?: EnquiryStatus,
) {
  const now = Date.now();
  const startMs = now - daysAgoStart * 86400000;
  const endMs = now - daysAgoEnd * 86400000;

  return rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    const inWindow = t <= startMs && t > endMs;
    return inWindow && (!status || r.enquiryStatus === status);
  }).length;
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function EnquiriesRoutePage() {
  const { data: enquiries = [], isLoading, error } = useEnquiries();
  const { mutateAsync: approve, isPending: isApprovePending } = useApproveEnquiry();
  const { mutateAsync: reject, isPending: isRejectPending } = useRejectEnquiry();
  const { mutateAsync: deleteEnquiry, isPending: isDeletePending } = useDeleteEnquiry();
  const auth = useAuthPayload();
  const isPending = isApprovePending || isRejectPending || isDeletePending;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | EnquiryStatus>("ALL");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const total = enquiries.length;

  const kpiMetrics: KpiMetric[] = useMemo(() => {
    const totalThisWeek = countInWindow(enquiries, 7, 0);
    const totalLastWeek = countInWindow(enquiries, 14, 7);
    const approvedCount = enquiries.filter((e) => e.enquiryStatus === "APPROVED").length;

    const totalMetric: KpiMetric = {
      id: "total",
      label: "Total enquiries",
      value: total,
      formattedValue: String(total),
      iconName: "Layers",
      changePercent: pctChange(totalThisWeek, totalLastWeek),
      changePeriod: "vs last 7 days",
    };

    const statusMetrics: KpiMetric[] = STATUS_ORDER.map((s) => {
      const count = enquiries.filter((e) => e.enquiryStatus === s).length;
      const thisWeek = countInWindow(enquiries, 7, 0, s);
      const lastWeek = countInWindow(enquiries, 14, 7, s);
      const metric: KpiMetric = {
        id: s,
        label: STATUS_META[s].label,
        value: count,
        formattedValue: String(count),
        iconName: STATUS_META[s].icon,
        changePercent: pctChange(thisWeek, lastWeek),
        changePeriod: "vs last 7 days",
      };

      if (s === "APPROVED" && total > 0) {
        metric.progressPercent = Math.round((approvedCount / total) * 100);
      }

      return metric;
    });

    return [totalMetric, ...statusMetrics];
  }, [enquiries, total]);

  const statusChartData = useMemo(
    () => STATUS_ORDER.map((s) => ({
      status: STATUS_META[s].label,
      count: enquiries.filter((e) => e.enquiryStatus === s).length,
      fill: STATUS_META[s].chart,
    })),
    [enquiries],
  );

  const trendData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: 0,
      });
    }

    const byDay = new Map(days.map((d) => [d.date, d]));
    enquiries.forEach((e) => {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      const bucket = byDay.get(key);
      if (bucket) bucket.count += 1;
    });

    return days;
  }, [enquiries]);

  const handleApprove = (id: string) => {
    if (!auth?.user) return;
    approve(
      { id, input: { status: "APPROVED", approvedBy: auth.user.name } },
      {
        onSuccess: () => toast.success("Enquiry approved"),
        onError: () => toast.error("Unable to approve enquiry"),
      },
    );
  };

  const handleReject = (id: string) => {
    if (!auth?.user) return;
    reject(
      { id, input: { status: "REJECTED", approvedBy: auth.user.name } },
      {
        onSuccess: () => toast.success("Enquiry rejected"),
        onError: () => toast.error("Unable to reject enquiry"),
      },
    );
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await deleteEnquiry(pendingDeleteId);
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Unable to delete enquiry");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <EnquiriesPage
      enquiries={enquiries}
      isLoading={isLoading}
      isPending={isPending}
      error={error}
      onApprove={handleApprove}
      onReject={handleReject}
      onDeleteConfirm={confirmDelete}
      onDeleteRequest={(id) => setPendingDeleteId(id)}
      onSearchChange={setQuery}
      onStatusChange={(value) => setStatus(value)}
      query={query}
      status={status}
      pendingDeleteId={pendingDeleteId}
      onDeleteDialogOpenChange={(open) => {
        if (!open) setPendingDeleteId(null);
      }}
      kpiMetrics={kpiMetrics}
      statusChartData={statusChartData}
      trendData={trendData}
    />
  );
}

