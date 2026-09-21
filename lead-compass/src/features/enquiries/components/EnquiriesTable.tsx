import {
  Calendar,
  CheckCircle2,
  Eye,
  Trash2,
  UserRound,
  Building2,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Enquiry } from "@/features/enquiries/types/enquiry.types";
import { STATUS_META } from "@/features/enquiries/utils/enquiries.constants";

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  isLoading: boolean;
  isPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function EnquiriesTable({
  enquiries,
  isLoading,
  isPending,
  onApprove,
  onReject,
  onDeleteRequest,
}: EnquiriesTableProps) {
  const navigate = useNavigate();
  const { tenantSlug = "" } = useParams();

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/50" />
        ))}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <XCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold">No enquiries found</h3>
        <p className="mt-1 text-sm text-muted-foreground">Try changing filters or adding a new enquiry.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {enquiries.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {row.first_name} {row.last_name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{row.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{row.company_name || "Individual"}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase">
                  {row.source}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_META[row.enquiryStatus].badge}`}
                >
                  {STATUS_META[row.enquiryStatus].label}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{new Date(row.created_at).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-muted-foreground">
                {row.project_name || <span className="italic text-muted-foreground/60">Not mentioned yet</span>}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" title="View" onClick={() => navigate(`/${tenantSlug}/enquires/${row.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Approve" onClick={() => onApprove(row.id)} disabled={isPending}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Reject" onClick={() => onReject(row.id)} disabled={isPending}>
                    <XCircle className="h-4 w-4 text-rose-500" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => onDeleteRequest(row.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
