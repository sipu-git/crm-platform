import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit";
import { viewLead, updateLead, deleteLead, clearLeadDetail, updateLeadStatus } from "@/features/leads/service1/slice";
import { type Lead, type LeadStatus, type Source, LEAD_STATUSES, LEAD_SOURCES, LEAD_STATUS_COLORS } from "@/features/leads/service1/lead.types";
import {
  Pencil, Check, X, Trash2, ArrowLeft, Mail, Phone, Building2, Briefcase, Lightbulb, ShieldCheck,
  Clock, User, Circle, PhoneCall, ThumbsUp, ThumbsDown, UserCog,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Contact } from "@/features/contacts/contact.types";
import { updateContact } from "@/features/contacts/slice";
import { AssignLeadDialog } from "@/components/leads/AssignLeadModal";

const PIPELINE_STAGES: LeadStatus[] = ["NEW", "CONTRACTED", "QUALIFIED", "DISQUALIFIED"];

const STATUS_GUIDE: Record<LeadStatus, string> = {
  NEW: "Just came in. Nobody has reached out yet.",
  CONTRACTED: "Contact has been made and a conversation is underway.",
  QUALIFIED: "Budget and fit are confirmed — ready to become a deal.",
  DISQUALIFIED: "Not a fit right now. No further follow-up needed.",
};

const STATUS_TIP: Record<LeadStatus, string> = {
  NEW: "Reach out within 24 hours — leads contacted on day one convert far more often than ones left waiting.",
  CONTRACTED: "Confirm budget, timeline, and who the decision-maker is before moving this to Qualified.",
  QUALIFIED: "This lead is ready to move forward — create a deal so it shows up in your pipeline.",
  DISQUALIFIED: "Leave a short note on why, so the next rep doesn't repeat the same outreach.",
};

const CONTACT_FIELDS: { key: keyof Contact; label: string; icon: React.ReactNode }[] = [
  { key: "first_name", label: "First name", icon: <User className="h-4 w-4" /> },
  { key: "last_name", label: "Last name", icon: <User className="h-4 w-4" /> },
  { key: "designation", label: "Designation", icon: <Briefcase className="h-4 w-4" /> },
  { key: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { key: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
];

// owner_name removed — ownership now comes from lead.assignee (see AssignLeadDialog)
const LEAD_FIELDS: { key: keyof Lead; label: string; icon: React.ReactNode }[] = [
  { key: "company_name", label: "Company", icon: <Building2 className="h-4 w-4" /> },
  { key: "source", label: "Source", icon: <Building2 className="h-4 w-4" /> },
];

// Lucide icons per stage (no emojis)
const STATUS_ICON_MAP: Record<LeadStatus, React.ReactNode> = {
  NEW: <Circle className="h-4 w-4" />,
  CONTRACTED: <PhoneCall className="h-4 w-4" />,
  QUALIFIED: <ThumbsUp className="h-4 w-4" />,
  DISQUALIFIED: <ThumbsDown className="h-4 w-4" />,
};

export function LeadDetailPage() {
  const { tenantSlug = "", leadId } = useParams<{ tenantSlug: string; leadId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lead = useAppSelector((s) => s.leads.leadDetail);
  const loading = useAppSelector((s) => s.leads.loading);

  const [editingField, setEditingField] = useState<{
    type: "lead" | "contact";
    key: keyof Lead | keyof Contact;
  } | null>(null);

  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  useEffect(() => {
    if (leadId) dispatch(viewLead(leadId));
    return () => {
      dispatch(clearLeadDetail());
    };
  }, [dispatch, leadId]);

  const startEdit = (
    type: "lead" | "contact",
    field: keyof Lead | keyof Contact,
    currentValue: unknown
  ) => {
    setEditingField({ type, key: field });
    setDraftValue(typeof currentValue === "string" ? currentValue : "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const saveField = async (field: keyof Lead) => {
    if (!lead) return;
    setSaving(true);
    try {
      await dispatch(
        updateLead({ leadId: lead.id, data: { [field]: draftValue } as Partial<Lead> })
      ).unwrap();
      toast.success("Updated");
      setEditingField(null);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (v: string) => {
    if (!lead) return;
    setSaving(true);
    try {
      await dispatch(
        updateLeadStatus({ leadId: lead.id, data: { status: v as LeadStatus } })
      ).unwrap();
      toast.success("Status updated");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleSourceChange = async (v: string) => {
    if (!lead) return;
    setSaving(true);
    try {
      await dispatch(
        updateLeadStatus({ leadId: lead.id, data: { source: v as Source } })
      ).unwrap();
      toast.success("Source updated");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update source");
    } finally {
      setSaving(false);
    }
  };

  const saveContactField = async (field: keyof Contact) => {
    if (!lead?.contact) return;

    setSaving(true);

    try {
      await dispatch(
        updateContact({
          id: lead.contact.id,
          changes: {
            [field]: draftValue,
          },
        })
      ).unwrap();
      await dispatch(viewLead(lead.id));
      toast.success("Contact updated");
      setEditingField(null);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await dispatch(deleteLead(lead.id)).unwrap();
      toast.success("Lead deleted");
      navigate(`/${tenantSlug}/leads`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete lead");
    }
  };

  if (loading || !lead) {
    return (
      <div className="p-6">
        <PageHeader title="Lead" description="Loading lead details..." />
      </div>
    );
  }

  const isDisqualified = lead.status === "DISQUALIFIED";
  const stageIndex = PIPELINE_STAGES.indexOf(lead.status as (typeof PIPELINE_STAGES)[number]);

  const initials = [lead.contact?.first_name, lead.contact?.last_name]
    .map((part) => part?.trim()?.[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const statusColor = LEAD_STATUS_COLORS[lead.status];

  return (
    <div className="min-h-screen">
      <PageHeader title="Lead" description="Everything you need to move this lead forward." />

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/${tenantSlug}/leads`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to leads
        </Button>

        {/* Identity header */}
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: `${statusColor}22`,
                color: statusColor,
              }}
            >
              {initials || "?"}
            </div>
            <div>
              <div className="text-lg font-semibold">
                {lead.contact?.first_name} {lead.contact?.last_name}
              </div>
              <div className="text-sm text-muted-foreground">
                {lead?.contact?.designation ? `${lead.contact.designation} · ` : ""}
                {lead.company_name}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lead.created_At && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Added{" "}
                {formatDistanceToNow(new Date(lead.created_At), { addSuffix: true })}
              </span>
            )}

            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${statusColor}1a`,
                color: statusColor,
              }}
            >
              {STATUS_ICON_MAP[lead.status]}
              {lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${tenantSlug}/communications/${lead.id}`)}
            >
              <Phone className="mr-2 h-3.5 w-3.5" />
              Contact
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
            >
              <UserCog className="mr-2 h-3.5 w-3.5" />
              {lead.assignee ? "Reassign" : "Assign"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Pipeline rail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Where this lead stands</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-slate-800">Project - {lead.project_name}</h2>
                <h2 className="text-slate-600">Project Type- {lead?.project_type}</h2>
                {!isDisqualified ? (
                  <div className="flex items-center">
                    {PIPELINE_STAGES.map((stage, i) => {
                      const isActive = i <= stageIndex;
                      const color = LEAD_STATUS_COLORS[stage];

                      return (
                        <div key={stage} className="flex flex-1 items-center last:flex-initial">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full border"
                              style={{
                                borderColor: isActive ? color : "var(--border)",
                                backgroundColor: isActive ? `${color}22` : "transparent",
                                color: isActive ? color : "var(--muted-foreground)",
                              }}
                            >
                              {STATUS_ICON_MAP[stage]}
                            </div>
                            <span
                              className={`text-xs ${isActive ? "font-medium" : "text-muted-foreground"
                                }`}
                            >
                              {stage.charAt(0) + stage.slice(1).toLowerCase()}
                            </span>
                          </div>
                          {i < PIPELINE_STAGES.length - 1 && (
                            <div
                              className="mx-2 h-0.5 flex-1"
                              style={{
                                backgroundColor: i < stageIndex ? color : "var(--border)",
                                opacity: 0.7,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    <span style={{ color: LEAD_STATUS_COLORS.DISQUALIFIED }}>
                      {STATUS_ICON_MAP.DISQUALIFIED}
                    </span>
                    This lead exited the pipeline as disqualified.
                  </div>
                )}

                <div className="mt-4">
                  <Select value={lead.status} onValueChange={handleStatusChange} disabled={saving}>
                    <SelectTrigger className="h-10 w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => {
                        const optionIndex = LEAD_STATUSES.indexOf(s);
                        const currentIndex = LEAD_STATUSES.indexOf(lead.status);
                        const isBackward = optionIndex < currentIndex;
                        return (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={isBackward}
                            title={isBackward ? "This lead has already moved past this stage" : undefined}
                          >
                            <span
                              className="flex items-center gap-2"
                              style={{
                                color: isBackward ? "var(--muted-foreground)" : LEAD_STATUS_COLORS[s],
                                opacity: isBackward ? 0.5 : 1,
                              }}
                            >
                              {STATUS_ICON_MAP[s]}
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Assignee */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Assigned to</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.assignee ? (
                  <div className="flex items-center justify-between rounded-md px-2 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground"><UserCog className="h-4 w-4" /></span>
                      <div>
                        <div className="text-sm font-medium">{lead.assignee.full_name}</div>
                        {lead.assignee.designation && (
                          <div className="text-xs text-muted-foreground">{lead.assignee.designation}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setAssignDialogOpen(true)}
                      className="text-muted-foreground transition-opacity hover:text-foreground"
                      aria-label="Reassign lead"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Nobody's assigned to this lead yet.
                    <Button variant="ghost" size="sm" onClick={() => setAssignDialogOpen(true)}>
                      Assign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contact information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CONTACT_FIELDS.map(({ key, label, icon }) => {
                  const value = lead.contact?.[key] as string | undefined;
                  const isEditing =
                    editingField?.type === "contact" && editingField.key === key;

                  return (
                    <div key={String(key)}>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            disabled={saving}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => saveContactField(key)}
                            disabled={saving}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/40">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{icon}</span>
                            <div>
                              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {label}
                              </div>
                              <div className="text-sm">{value || "Not set"}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => startEdit("contact", key, value)}
                            className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                            aria-label={`Edit ${label}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Source */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Lead source</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={lead.source} onValueChange={handleSourceChange} disabled={saving}>
                  <SelectTrigger className="h-10 w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Where a lead came from shapes how quickly it should be followed up — a webinar
                  signup is warm and time-sensitive, while a general website form may need a
                  qualifying call first.
                </p>
              </CardContent>
            </Card>

            <div className="pt-2">
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete lead
              </Button>
            </div>
          </div>

          {/* Sidebar: guidance content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4" />
                  Tip for this stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{STATUS_TIP[lead.status]}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {LEAD_STATUSES.map((s) => (
                  <div key={s} className="flex gap-3">
                    <span
                      className="mt-0.5"
                      style={{ color: LEAD_STATUS_COLORS[s], opacity: 0.9 }}
                    >
                      {STATUS_ICON_MAP[s]}
                    </span>
                    <div>
                      <div className="text-xs font-medium">{s.charAt(0) + s.slice(1).toLowerCase()}</div>
                      <div className="text-xs text-muted-foreground">{STATUS_GUIDE[s]}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Data handling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Only people in your workspace can see this lead's contact details. Deleting a
                  lead removes it permanently and can't be undone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AssignLeadDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        leadId={lead.id}
        currentAssignee={lead.assignee}
      />
    </div>
  );
}