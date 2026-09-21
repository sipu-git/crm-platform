import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, CheckCircle2, XCircle, UserRound, Building2, Mail, Phone,
  FileText, Calendar, Briefcase, Wallet, Clock, Tag, ShieldCheck, UserCheck,
} from "lucide-react";
import { useEnquiry, useApproveEnquiry, useRejectEnquiry } from "@/features/enquiries/hooks/useEnquiries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EnquiryStatus } from "@/features/enquiries/types/enquiry.types";

const STATUS_TONE: Record<EnquiryStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  IN_REVIEW: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

function InfoRow({
  icon: Icon,
  label,
  value,
  muted,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("truncate text-sm font-medium", muted && "text-muted-foreground font-normal italic")}>
          {value ?? <span className="text-muted-foreground italic">Not provided</span>}
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return undefined;
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatProjectType(value?: string) {
  if (!value) return undefined;
  return value.replace(/_/g, " ");
}

export default function EnquiryDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: enquiry, isLoading, isError, error } = useEnquiry(id);
  const { mutate: approve, isPending: isApprovePending } = useApproveEnquiry();
  const { mutate: reject, isPending: isRejectPending } = useRejectEnquiry();
  const isPending = isApprovePending || isRejectPending;

  const fullName = useMemo(
    () => (enquiry ? `${enquiry.first_name} ${enquiry.last_name}` : ""),
    [enquiry],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading enquiry...</div>
      </div>
    );
  }

  if (isError || !enquiry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-4 text-center">
        <div className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Unable to load this enquiry."}
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to enquiries
        </Button>
      </div>
    );
  }

  const isDecided = enquiry.enquiryStatus === "APPROVED" || enquiry.enquiryStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Enquiry
              </div>
              <h1 className="text-2xl font-semibold md:text-3xl">{fullName}</h1>
              {enquiry.designation && (
                <p className="text-sm text-muted-foreground">{enquiry.designation}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", STATUS_TONE[enquiry.enquiryStatus])}
            >
              {enquiry.enquiryStatus.replace("_", " ")}
            </Badge>
            {enquiry.isApproved && (
              <Badge variant="outline" className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Approved
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column: Contact + Meta */}
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRound className="h-4 w-4" /> Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={Mail} label="Email" value={enquiry.email} />
                <InfoRow icon={Phone} label="Phone" value={enquiry.phone} muted={!enquiry.phone} />
                <InfoRow
                  icon={Building2}
                  label="Company"
                  value={enquiry.company_name}
                  muted={!enquiry.company_name}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" /> Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={Calendar} label="Created" value={formatDate(enquiry.created_at)} />
                <InfoRow
                  icon={Clock}
                  label="Last updated"
                  value={formatDate(enquiry.updated_at)}
                  muted={!enquiry.updated_at}
                />
                <InfoRow
                  icon={UserCheck}
                  label="Assigned to"
                  value={enquiry.assignedTo}
                  muted={!enquiry.assignedTo}
                />
                <InfoRow
                  icon={ShieldCheck}
                  label="Approved by"
                  value={enquiry.approvedBy}
                  muted={!enquiry.approvedBy}
                />
                <InfoRow icon={Tag} label="Source" value={enquiry.source.replace("_", " ")} />
              </CardContent>
            </Card>
          </div>

          {/* Right column: Project + Description */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" /> Project details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={FileText} label="Project name" value={enquiry.project_name} />
                  <InfoRow
                    icon={Tag}
                    label="Project type"
                    value={formatProjectType(enquiry.project_type)}
                    muted={!enquiry.project_type}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Timeline"
                    value={enquiry.timeline}
                    muted={!enquiry.timeline}
                  />
                  <InfoRow
                    icon={Wallet}
                    label="Budget"
                    value={enquiry.budget}
                    muted={!enquiry.budget}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" /> Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-7 text-foreground/80">
                  {enquiry.description || (
                    <span className="italic text-muted-foreground">No description provided.</span>
                  )}
                </p>
              </CardContent>
            </Card>

            {!isDecided && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Decision</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    className="gap-2"
                    disabled={isPending}
                    onClick={() =>
                      approve(
                        { id: enquiry.id, input: { status: "APPROVED", approvedBy: "Admin" } },
                        {
                          onSuccess: () => toast.success("Enquiry approved"),
                          onError: () => toast.error("Approval failed"),
                        },
                      )
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={isPending}
                    onClick={() =>
                      reject(
                        { id: enquiry.id, input: { status: "REJECTED", approvedBy: "Admin" } },
                        {
                          onSuccess: () => toast.success("Enquiry rejected"),
                          onError: () => toast.error("Decision failed"),
                        },
                      )
                    }
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}