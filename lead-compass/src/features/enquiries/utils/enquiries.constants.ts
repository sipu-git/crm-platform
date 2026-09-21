import { KpiMetric } from "@/features/dashboard/dashboard.types";
import type { Enquiry, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";

export interface EnquiriesPageProps {
  enquiries: Enquiry[];
  isLoading: boolean;
  isPending: boolean;
  error?: Error | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeleteConfirm: () => void;
  onDeleteRequest: (id: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | EnquiryStatus) => void;
  query: string;
  status: "ALL" | EnquiryStatus;
  pendingDeleteId: string | null;
  onDeleteDialogOpenChange: (open: boolean) => void;
  kpiMetrics: KpiMetric[];
  statusChartData: Array<{ status: string; count: number; fill: string }>;
  trendData: Array<{ date: string; label: string; count: number }>;
}

export const STATUS_META: Record<EnquiryStatus,
  { label: string; badge: string; chart: string; icon: string }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    chart: "#f59e0b",
    icon: "Clock",
  },
  IN_REVIEW: {
    label: "In Review",
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    chart: "#3b82f6",
    icon: "Target",
  },
  APPROVED: {
    label: "Approved",
    badge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    chart: "#10b981",
    icon: "CheckCircle2",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-500/15 text-rose-600 border-rose-500/30",
    chart: "#f43f5e",
    icon: "AlertTriangle",
  },
};

export const STATUS_ORDER: EnquiryStatus[] = ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"];
