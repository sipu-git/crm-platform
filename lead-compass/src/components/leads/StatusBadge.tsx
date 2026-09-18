import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_META, titleCase } from "@/utils/status-meta";
import { LEAD_STATUS_COLORS, LeadStatus } from "@/features/leads/types/lead.types";

export const StatusBadge = memo(function StatusBadge({ status }: { status: LeadStatus }) {
  const color = LEAD_STATUS_COLORS[status];
  return (
    <Badge
      variant="secondary"
      className="gap-1 px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
      data-testid={`lead-status-badge-${status.toLowerCase()}`}
    >
      {STATUS_META[status].icon}
      {titleCase(status)}
    </Badge>
  );
});