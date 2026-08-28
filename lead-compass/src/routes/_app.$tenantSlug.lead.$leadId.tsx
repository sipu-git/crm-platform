import { JSX, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, differenceInDays, differenceInHours } from "date-fns";
import { toast } from "sonner";
import {
  Pencil, Check, X, Trash2, ArrowLeft, Mail, Phone, Building2, Briefcase,
  Lightbulb, ShieldCheck, Clock, User, Circle, PhoneCall, ThumbsUp, ThumbsDown,
  UserCog, Layers, Tag, Calendar, MoreVertical, Activity, Target, FileText,
  History, RefreshCw, UserPlus, MessageSquare, ChevronRight, Sparkles,
  TrendingUp, AlertCircle, Zap, ArrowRight, Flag,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { viewLead, updateLead, deleteLead, clearLeadDetail, updateLeadStatus } from "@/features/leads/service1/slice";
import {
  type Lead, type LeadStatus, type Source,
  LEAD_STATUSES, LEAD_SOURCES, LEAD_STATUS_COLORS,
} from "@/features/leads/service1/lead.types";
import { Contact } from "@/features/contacts/contact.types";
import { updateContact } from "@/features/contacts/slice";
import { AssignLeadDialog } from "@/components/leads/AssignLeadModal";

/* ------------------------------------------------------------------ */
/*  Constants & meta                                                   */
/* ------------------------------------------------------------------ */

const PIPELINE_STAGES: LeadStatus[] = ["NEW", "CONTRACTED", "QUALIFIED"];
const ALL_STAGES: LeadStatus[] = ["NEW", "CONTRACTED", "QUALIFIED", "DISQUALIFIED"];

const STATUS_META: Record<
  LeadStatus,
  {
    icon: JSX.Element;
    guide: string;
    tip: string;
    description: string;
    shortLabel: string;
    nextLabel?: string;
  }
> = {
  NEW: {
    icon: <Circle className="h-3.5 w-3.5" />,
    guide: "Just came in. Nobody has reached out yet.",
    tip: "Reach out within 24 hours — day-one contact converts far better than delayed follow-up.",
    description: "Initial contact",
    shortLabel: "New",
    nextLabel: "Mark as Contacted",
  },
  CONTRACTED: {
    icon: <PhoneCall className="h-3.5 w-3.5" />,
    guide: "Contact has been made and a conversation is underway.",
    tip: "Confirm budget, timeline, and decision-maker before moving to Qualified.",
    description: "In conversation",
    shortLabel: "Contacted",
    nextLabel: "Mark as Qualified",
  },
  QUALIFIED: {
    icon: <ThumbsUp className="h-3.5 w-3.5" />,
    guide: "Budget and fit are confirmed — ready to become a deal.",
    tip: "Create a deal so this lead shows up in your pipeline.",
    description: "Ready to convert",
    shortLabel: "Qualified",
  },
  DISQUALIFIED: {
    icon: <ThumbsDown className="h-3.5 w-3.5" />,
    guide: "Not a fit right now. No further follow-up needed.",
    tip: "Leave a short note on why, so the next rep doesn't repeat the same outreach.",
    description: "Not a fit",
    shortLabel: "Disqualified",
  },
};

type FieldDef<T> = { key: keyof T & string; label: string; icon: JSX.Element; placeholder?: string };

const CONTACT_FIELDS: FieldDef<Contact>[] = [
  { key: "first_name", label: "First name", icon: <User className="h-3.5 w-3.5" />, placeholder: "John" },
  { key: "last_name", label: "Last name", icon: <User className="h-3.5 w-3.5" />, placeholder: "Doe" },
  { key: "designation", label: "Designation", icon: <Briefcase className="h-3.5 w-3.5" />, placeholder: "CEO" },
  { key: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" />, placeholder: "john@example.com" },
  { key: "phone", label: "Phone", icon: <Phone className="h-3.5 w-3.5" />, placeholder: "+1 234 567 890" },
];

const LEAD_FIELDS: FieldDef<Lead>[] = [
  { key: "company_name", label: "Company", icon: <Building2 className="h-3.5 w-3.5" />, placeholder: "Acme Inc" },
  { key: "project_name", label: "Project name", icon: <Layers className="h-3.5 w-3.5" />, placeholder: "Website redesign" },
  { key: "project_type", label: "Project type", icon: <Tag className="h-3.5 w-3.5" />, placeholder: "Web development" },
];

const STAT_TONE_CLASSES: Record<"blue" | "green" | "purple" | "amber", string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const humanize = (s: string) => titleCase(s).replace(/_/g, " ");

/* ------------------------------------------------------------------ */
/*  Activity types                                                     */
/* ------------------------------------------------------------------ */

type LeadActivityType = "created" | "status_change" | "assigned" | "contact_made" | "note" | "updated";

interface LeadActivity {
  id: string;
  type: LeadActivityType;
  label: string;
  detail?: string;
  timestamp: string;
  actor?: string;
}

interface StatusHistoryEntry {
  status: LeadStatus;
  changed_At: string;
  actor?: string;
}

type LeadWithActivity = Lead & {
  activities?: LeadActivity[];
  status_history?: StatusHistoryEntry[];
  assigned_At?: string;
  updated_At?: string;
};

const ACTIVITY_ICON: Record<LeadActivityType, JSX.Element> = {
  created: <Circle className="h-3.5 w-3.5" />,
  status_change: <RefreshCw className="h-3.5 w-3.5" />,
  assigned: <UserPlus className="h-3.5 w-3.5" />,
  contact_made: <PhoneCall className="h-3.5 w-3.5" />,
  note: <MessageSquare className="h-3.5 w-3.5" />,
  updated: <Pencil className="h-3.5 w-3.5" />,
};

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function IconTip({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const StatusBadge = memo(function StatusBadge({ status }: { status: LeadStatus }) {
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

function InfoCard({
  title, icon, description, children, action,
}: {
  title: string;
  icon?: JSX.Element;
  description?: string;
  action?: JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/60">
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {icon}
            {title}
          </CardTitle>
          {description && <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Editable field                                                     */
/* ------------------------------------------------------------------ */

interface EditableFieldProps {
  type: "lead" | "contact";
  fieldKey: string;
  label: string;
  icon?: JSX.Element;
  value?: string;
  placeholder?: string;
  isEditing: boolean;
  draftValue: string;
  saving: boolean;
  onStartEdit: (type: "lead" | "contact", key: string, currentValue: string) => void;
  onChangeDraft: (v: string) => void;
  onSave: (type: "lead" | "contact", key: string) => void;
  onCancel: () => void;
}

const EditableField = memo(function EditableField({
  type, fieldKey, label, icon, value, placeholder, isEditing, draftValue, saving,
  onStartEdit, onChangeDraft, onSave, onCancel,
}: EditableFieldProps) {
  const testId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="group relative rounded-lg p-2 transition-colors hover:bg-muted/40">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={draftValue}
            onChange={(e) => onChangeDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(type, fieldKey);
              if (e.key === "Escape") onCancel();
            }}
            disabled={saving}
            autoFocus
            className="h-8 flex-1"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            data-testid={`${testId}-input`}
          />
          <IconTip label="Save">
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onSave(type, fieldKey)} disabled={saving} data-testid={`${testId}-save`}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </IconTip>
          <IconTip label="Cancel">
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onCancel} disabled={saving} data-testid={`${testId}-cancel`}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </IconTip>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${!value ? "italic text-muted-foreground/70" : ""}`} data-testid={`${testId}-value`}>
            {value || `No ${label.toLowerCase()}`}
          </span>
          <IconTip label={`Edit ${label}`}>
            <button
              type="button"
              onClick={() => onStartEdit(type, fieldKey, value || "")}
              aria-label={`Edit ${label}`}
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
              data-testid={`${testId}-edit`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </IconTip>
        </div>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Horizontal stepper (new)                                           */
/* ------------------------------------------------------------------ */

const HorizontalStepper = memo(function HorizontalStepper({
  status,
  statusHistory,
  onSelect,
  saving,
}: {
  status: LeadStatus;
  statusHistory?: StatusHistoryEntry[];
  onSelect: (s: LeadStatus) => void;
  saving: boolean;
}) {
  const isDisqualified = status === "DISQUALIFIED";
  const currentIndex = isDisqualified
    ? PIPELINE_STAGES.length - 1
    : Math.max(0, PIPELINE_STAGES.indexOf(status));

  // % progress across the pipeline (visualised via a filled bar).
  const progress = isDisqualified
    ? 100
    : ((currentIndex + 1) / PIPELINE_STAGES.length) * 100;

  const timestampFor = (stage: LeadStatus) =>
    statusHistory?.find((h) => h.status === stage)?.changed_At;

  return (
    <div className="space-y-4">
      {/* Progress rail */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-[18px] h-1 rounded-full bg-muted" aria-hidden="true" />
        <div
          className="absolute left-0 top-[18px] h-1 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: isDisqualified
              ? "#DC2626"
              : `linear-gradient(90deg, ${LEAD_STATUS_COLORS[PIPELINE_STAGES[0]]}, ${LEAD_STATUS_COLORS[status] ?? LEAD_STATUS_COLORS.QUALIFIED})`,
          }}
          aria-hidden="true"
        />

        <ol className="relative grid grid-cols-3 gap-2">
          {PIPELINE_STAGES.map((stage, index) => {
            const color = LEAD_STATUS_COLORS[stage];
            const isCurrent = !isDisqualified && index === currentIndex;
            const isCompleted = !isDisqualified && index < currentIndex;
            const isReachable = !isDisqualified && index <= currentIndex + 1;
            const timestamp = timestampFor(stage);

            return (
              <li key={stage} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isReachable && !saving && onSelect(stage)}
                  disabled={!isReachable || saving || stage === status}
                  aria-label={`Go to ${titleCase(stage)}`}
                  aria-current={isCurrent ? "step" : undefined}
                  data-testid={`stepper-node-${stage.toLowerCase()}`}
                  className={[
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background",
                    "transition-all duration-300",
                    isReachable && stage !== status ? "cursor-pointer hover:scale-110" : "cursor-default",
                    isCurrent ? "scale-110 shadow-lg ring-4" : "",
                  ].join(" ")}
                  style={{
                    borderColor: isCompleted || isCurrent ? color : "hsl(var(--border))",
                    backgroundColor: isCompleted ? color : isCurrent ? `${color}15` : "hsl(var(--background))",
                    color: isCompleted ? "#fff" : isCurrent || isReachable ? color : "hsl(var(--muted-foreground))",
                    // @ts-expect-error CSS custom for ring color
                    "--tw-ring-color": isCurrent ? `${color}30` : undefined,
                  }}
                >
                  {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : STATUS_META[stage].icon}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full opacity-40"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  )}
                </button>

                <div className="mt-2 min-h-[36px] text-center">
                  <p
                    className={[
                      "text-[11px] font-semibold leading-tight",
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {STATUS_META[stage].shortLabel}
                  </p>
                  {timestamp ? (
                    <time
                      className="mt-0.5 block text-[10px] text-muted-foreground/80"
                      dateTime={timestamp}
                    >
                      {format(new Date(timestamp), "MMM d")}
                    </time>
                  ) : (
                    <span className="mt-0.5 block text-[10px] text-muted-foreground/60">
                      {isCurrent ? "Now" : "—"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {isDisqualified && (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#DC262630", backgroundColor: "#DC262608", color: "#DC2626" }}
        >
          <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">This lead has exited the pipeline.</span>
        </div>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Vertical rich timeline                                             */
/* ------------------------------------------------------------------ */

function getStageDuration(
  stage: LeadStatus,
  currentStatus: LeadStatus,
  statusHistory?: StatusHistoryEntry[],
): string | null {
  if (!statusHistory?.length) return null;

  const entered = statusHistory.find((h) => h.status === stage)?.changed_At;
  if (!entered) return null;

  // Find next status change after this stage.
  const sorted = [...statusHistory].sort(
    (a, b) => new Date(a.changed_At).getTime() - new Date(b.changed_At).getTime(),
  );
  const idx = sorted.findIndex((h) => h.status === stage && h.changed_At === entered);
  const nextEntry = sorted[idx + 1];

  const end = nextEntry ? new Date(nextEntry.changed_At) : stage === currentStatus ? new Date() : null;
  if (!end) return null;

  const start = new Date(entered);
  const days = differenceInDays(end, start);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;

  const hours = differenceInHours(end, start);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;

  return "under an hour";
}

const OrderStatusTimeline = memo(function OrderStatusTimeline({
  status,
  statusHistory,
}: {
  status: LeadStatus;
  statusHistory?: StatusHistoryEntry[];
}) {
  const activeStages = PIPELINE_STAGES;
  const isDisqualified = status === "DISQUALIFIED";
  const currentIndex = isDisqualified ? activeStages.length : Math.max(0, activeStages.indexOf(status));
  const nodes: LeadStatus[] = [...activeStages, "DISQUALIFIED"];

  const timestampFor = (stage: LeadStatus) =>
    statusHistory?.find((h) => h.status === stage)?.changed_At;

  const getStatusColor = (stage: LeadStatus) =>
    stage === "DISQUALIFIED" ? "#DC2626" : LEAD_STATUS_COLORS[stage];

  return (
    <ol className="relative" aria-label="Lead status timeline">
      {nodes.map((stage, index) => {
        const isTerminalBad = stage === "DISQUALIFIED";
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        const isLast = index === nodes.length - 1;
        const color = getStatusColor(stage);
        const timestamp = timestampFor(stage);
        const duration = getStageDuration(stage, status, statusHistory);

        return (
          <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[19px] top-10 h-[calc(100%-1.25rem)] w-[2px] rounded-full transition-all duration-500"
                style={{
                  background:
                    isCompleted
                      ? `linear-gradient(180deg, ${color}, ${getStatusColor(nodes[index + 1])})`
                      : "hsl(var(--border))",
                }}
                aria-hidden="true"
              />
            )}

            <span
              className={[
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                "transition-all duration-300",
                isCurrent ? "scale-110 shadow-md" : "",
                isUpcoming ? "opacity-70" : "",
              ].join(" ")}
              style={{
                borderColor: isCompleted || isCurrent ? color : "hsl(var(--border))",
                backgroundColor: isCompleted
                  ? color
                  : isCurrent
                    ? `${color}15`
                    : "hsl(var(--background))",
                color: isCompleted ? "#fff" : isCurrent ? color : "hsl(var(--muted-foreground))",
              }}
            >
              {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : STATUS_META[stage].icon}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={[
                    "text-sm font-semibold leading-snug",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {titleCase(stage)}
                </p>

                <Badge
                  variant="secondary"
                  className="h-5 rounded-full px-2 text-[10px] font-semibold"
                  style={{
                    backgroundColor: isCompleted || isCurrent ? `${color}15` : "hsl(var(--muted))",
                    color: isCompleted || isCurrent ? color : "hsl(var(--muted-foreground))",
                    border: isCompleted || isCurrent ? `1px solid ${color}35` : "1px solid hsl(var(--border))",
                  }}
                >
                  {isCurrent ? (isTerminalBad ? "Exited" : "Current") : isCompleted ? "Completed" : "Upcoming"}
                </Badge>

                {duration && (
                  <Badge variant="outline" className="h-5 rounded-full px-2 text-[10px] font-medium">
                    <Clock className="mr-1 h-2.5 w-2.5" />
                    {duration}
                  </Badge>
                )}
              </div>

              <p
                className={[
                  "mt-1 text-xs leading-relaxed",
                  isUpcoming ? "text-muted-foreground/70" : "text-muted-foreground",
                ].join(" ")}
              >
                {STATUS_META[stage].description}
              </p>

              {timestamp && (
                <time
                  className="mt-1.5 block text-[11px] font-medium text-muted-foreground/80"
                  dateTime={timestamp}
                >
                  {format(new Date(timestamp), "MMM d, yyyy · h:mm a")}
                </time>
              )}

              {isCurrent && !isTerminalBad && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${color}10`, color }}
                >
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  Action in progress
                </div>
              )}

              {isTerminalBad && isCurrent && (
                <div
                  className="mt-2 rounded-lg border px-3 py-2"
                  style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
                >
                  <div className="flex items-start gap-2">
                    <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color }}>
                        Final action
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        This lead is no longer a suitable opportunity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
});

/* ------------------------------------------------------------------ */
/*  Activity                                                           */
/* ------------------------------------------------------------------ */

const TimelineItem = memo(function TimelineItem({
  activity, isLast,
}: {
  activity: LeadActivity;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" aria-hidden="true" />
      )}
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground shadow-sm">
        {ACTIVITY_ICON[activity.type]}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <p className="text-sm font-medium leading-snug">{activity.label}</p>
          <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={activity.timestamp}>
            {format(new Date(activity.timestamp), "MMM d, yyyy · h:mm a")}
          </time>
        </div>
        {activity.detail && <p className="mt-0.5 text-xs text-muted-foreground">{activity.detail}</p>}
        {activity.actor && <p className="mt-0.5 text-[11px] text-muted-foreground/80">by {activity.actor}</p>}
      </div>
    </li>
  );
});

const ActivityTimeline = memo(function ActivityTimeline({ activities }: { activities: LeadActivity[] }) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
        <History className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <ol className="mt-1">
      {activities.map((activity, i) => (
        <TimelineItem key={activity.id} activity={activity} isLast={i === activities.length - 1} />
      ))}
    </ol>
  );
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type EditingKey = { type: "lead" | "contact"; key: string } | null;

export function LeadDetailPage() {
  const { tenantSlug = "", leadId } = useParams<{ tenantSlug: string; leadId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lead = useAppSelector((s) => s.leads.leadDetail) as LeadWithActivity | null;
  const loading = useAppSelector((s) => s.leads.loading);

  const [editingField, setEditingField] = useState<EditingKey>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const draftValueRef = useRef("");
  useEffect(() => { draftValueRef.current = draftValue; }, [draftValue]);

  useEffect(() => {
    if (leadId) dispatch(viewLead(leadId));
    return () => { dispatch(clearLeadDetail()); };
  }, [dispatch, leadId]);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setDraftValue("");
  }, []);

  const handleStartEdit = useCallback((type: "lead" | "contact", key: string, currentValue: string) => {
    setEditingField({ type, key });
    setDraftValue(currentValue);
  }, []);

  const runAction = useCallback(async <T,>(action: Promise<T>, successMsg: string, onDone?: () => void) => {
    setSaving(true);
    try {
      await action;
      toast.success(successMsg);
      onDone?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }, []);

  const handleSaveField = useCallback((type: "lead" | "contact", key: string) => {
    if (!lead) return;
    const value = draftValueRef.current;

    if (type === "lead") {
      runAction(
        dispatch(updateLead({ leadId: lead.id, data: { [key]: value } as Partial<Lead> })).unwrap(),
        "Lead updated",
        cancelEdit,
      );
    } else if (lead.contact) {
      runAction(
        dispatch(updateContact({ id: lead.contact.id, changes: { [key]: value } })).unwrap()
          .then(() => dispatch(viewLead(lead.id))),
        "Contact updated",
        cancelEdit,
      );
    }
  }, [lead, dispatch, runAction, cancelEdit]);

  const handleStatusChange = useCallback((v: string) => {
    if (!lead) return;
    runAction(
      dispatch(updateLeadStatus({ leadId: lead.id, data: { status: v as LeadStatus } })).unwrap(),
      `Moved to ${titleCase(v)}`,
    );
  }, [lead, dispatch, runAction]);

  const handleSourceChange = useCallback((v: string) => {
    if (!lead) return;
    runAction(
      dispatch(updateLeadStatus({ leadId: lead.id, data: { source: v as Source } })).unwrap(),
      "Source updated",
    );
  }, [lead, dispatch, runAction]);

  const handleDelete = useCallback(async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteLead(lead.id)).unwrap();
      toast.success("Lead deleted");
      navigate(`/${tenantSlug}/leads`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete lead");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [lead, dispatch, navigate, tenantSlug]);

  /* ---------- Derived ---------- */

  const fullName = useMemo(
    () => [lead?.contact?.first_name, lead?.contact?.last_name].filter(Boolean).join(" "),
    [lead?.contact?.first_name, lead?.contact?.last_name],
  );

  const initials = useMemo(
    () => [lead?.contact?.first_name, lead?.contact?.last_name]
      .map((p) => p?.trim()?.[0]).filter(Boolean).join("").toUpperCase(),
    [lead?.contact?.first_name, lead?.contact?.last_name],
  );

  const createdDate = useMemo(
    () => (lead?.created_At ? format(new Date(lead.created_At), "MMM d, yyyy") : null),
    [lead?.created_At],
  );

  const leadAge = useMemo(
    () => (lead?.created_At ? formatDistanceToNow(new Date(lead.created_At), { addSuffix: false }) : null),
    [lead?.created_At],
  );

  // Time in current stage — powers the sticky "duration" pill.
  const timeInStage = useMemo(() => {
    if (!lead) return null;
    const entered = lead.status_history?.filter((h) => h.status === lead.status).slice(-1)[0]?.changed_At
      ?? lead.updated_At
      ?? lead.created_At;
    if (!entered) return null;
    return formatDistanceToNow(new Date(entered), { addSuffix: false });
  }, [lead]);

  // The next best stage to move to (skips backwards, skips DISQUALIFIED unless already there).
  const nextStage = useMemo<LeadStatus | null>(() => {
    if (!lead || lead.status === "DISQUALIFIED") return null;
    const idx = PIPELINE_STAGES.indexOf(lead.status);
    if (idx === -1 || idx === PIPELINE_STAGES.length - 1) return null;
    return PIPELINE_STAGES[idx + 1];
  }, [lead]);

  const summaryStats = useMemo(() => {
    if (!lead) return [];
    return [
      { icon: <Clock className="h-4 w-4" />, label: "Age", value: leadAge ? `${leadAge} old` : "N/A", tone: "blue" as const },
      { icon: <Activity className="h-4 w-4" />, label: "In current stage", value: timeInStage ?? "—", tone: "amber" as const },
      { icon: <Target className="h-4 w-4" />, label: "Source", value: humanize(lead.source), tone: "purple" as const },
      { icon: <TrendingUp className="h-4 w-4" />, label: "Status", value: titleCase(lead.status), tone: "green" as const },
    ];
  }, [lead, leadAge, timeInStage]);

  if (loading || !lead) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-testid="lead-detail-loading">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading lead details…</p>
        </div>
      </div>
    );
  }

  const statusColor = LEAD_STATUS_COLORS[lead.status];
  const isLeadEditing = (k: string) => editingField?.type === "lead" && editingField.key === k;
  const isContactEditing = (k: string) => editingField?.type === "contact" && editingField.key === k;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background" data-testid="lead-detail-page">
        {/* ------------------------------------------------------------- */}
        {/*  Sticky header                                                 */}
        {/* ------------------------------------------------------------- */}
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(`/${tenantSlug}/leads`)} data-testid="back-btn">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold leading-tight">{fullName || "Lead Details"}</h1>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{lead.company_name || "No company"}</span>
                  <span aria-hidden>•</span>
                  <StatusBadge status={lead.status} />
                  {timeInStage && (
                    <>
                      <span aria-hidden>•</span>
                      <span className="hidden items-center gap-1 sm:inline-flex">
                        <Clock className="h-3 w-3" />
                        {timeInStage} in stage
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {nextStage && (
                <IconTip label={STATUS_META[nextStage].tip}>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(nextStage)}
                    disabled={saving}
                    className="hidden sm:inline-flex"
                    style={{ backgroundColor: LEAD_STATUS_COLORS[nextStage], color: "#fff" }}
                    data-testid="quick-advance-btn"
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    {STATUS_META[lead.status].nextLabel}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </IconTip>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate(`/${tenantSlug}/communications/${lead.id}`)} data-testid="contact-btn">
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                Contact
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)} data-testid="assign-btn">
                <UserCog className="mr-1.5 h-3.5 w-3.5" />
                {lead.assignee ? "Reassign" : "Assign"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="more-menu-btn">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/${tenantSlug}/communications/${lead.id}`)}>
                    <Phone className="mr-2 h-4 w-4" /> Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAssignDialogOpen(true)}>
                    <UserCog className="mr-2 h-4 w-4" /> {lead.assignee ? "Reassign" : "Assign"}
                  </DropdownMenuItem>
                  {lead.status !== "DISQUALIFIED" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("DISQUALIFIED")}
                      className="text-destructive focus:text-destructive"
                      data-testid="disqualify-menu-item"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" /> Disqualify
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive" data-testid="delete-menu-item">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-5">
          {/* ------------------------------------------------------------- */}
          {/*  Hero                                                          */}
          {/* ------------------------------------------------------------- */}
          <section className="mb-5 grid items-stretch gap-4 lg:grid-cols-3">
            <Card
              className="relative flex h-full flex-col justify-center overflow-hidden border-border/60 lg:col-span-2"
              style={{
                background: `linear-gradient(135deg, ${statusColor}08 0%, transparent 40%)`,
              }}
            >
              {/* Decorative accent */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: statusColor }}
                aria-hidden="true"
              />
              <CardContent className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-16 w-16 shrink-0 border-2 shadow-md" style={{ borderColor: statusColor }}>
                    <AvatarFallback
                      className="text-lg font-bold"
                      style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                    >
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold leading-tight">{fullName || "Unnamed Contact"}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {lead.contact?.designation && (
                        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{lead.contact.designation}</span>
                      )}
                      {lead.company_name && (
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{lead.company_name}</span>
                      )}
                      {createdDate && (
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Added {createdDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {lead.contact?.email && (
                    <IconTip label={`Email ${lead.contact.email}`}>
                      <a href={`mailto:${lead.contact.email}`} data-testid="hero-email-link">
                        <Button variant="outline" size="icon" className="h-9 w-9"><Mail className="h-4 w-4" /></Button>
                      </a>
                    </IconTip>
                  )}
                  {lead.contact?.phone && (
                    <IconTip label={`Call ${lead.contact.phone}`}>
                      <a href={`tel:${lead.contact.phone}`} data-testid="hero-phone-link">
                        <Button variant="outline" size="icon" className="h-9 w-9"><Phone className="h-4 w-4" /></Button>
                      </a>
                    </IconTip>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-border/60">
              <CardContent className="grid flex-1 grid-cols-2 gap-3 p-4">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${STAT_TONE_CLASSES[s.tone]}`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="truncate text-sm font-semibold" title={s.value}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* ------------------------------------------------------------- */}
          {/*  Main grid                                                     */}
          {/* ------------------------------------------------------------- */}
          <section className="grid items-start gap-5 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-5 lg:col-span-2">
              <InfoCard title="Company & project" icon={<FileText className="h-4 w-4" />}>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {LEAD_FIELDS.map((f) => {
                    const active = isLeadEditing(f.key);
                    return (
                      <EditableField
                        key={f.key}
                        type="lead"
                        fieldKey={f.key}
                        label={f.label}
                        icon={f.icon}
                        value={lead[f.key] as string | undefined}
                        placeholder={f.placeholder}
                        isEditing={active}
                        draftValue={active ? draftValue : ""}
                        saving={active && saving}
                        onStartEdit={handleStartEdit}
                        onChangeDraft={setDraftValue}
                        onSave={handleSaveField}
                        onCancel={cancelEdit}
                      />
                    );
                  })}
                </div>
              </InfoCard>

              <InfoCard title="Contact information" icon={<User className="h-4 w-4" />}>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {CONTACT_FIELDS.map((f) => {
                    const active = isContactEditing(f.key);
                    const value = lead.contact?.[f.key] as string | undefined;
                    return (
                      <EditableField
                        key={f.key}
                        type="contact"
                        fieldKey={f.key}
                        label={f.label}
                        icon={f.icon}
                        value={value}
                        placeholder={f.placeholder}
                        isEditing={active}
                        draftValue={active ? draftValue : ""}
                        saving={active && saving}
                        onStartEdit={handleStartEdit}
                        onChangeDraft={setDraftValue}
                        onSave={handleSaveField}
                        onCancel={cancelEdit}
                      />
                    );
                  })}
                </div>
              </InfoCard>

              <InfoCard title="Lead source" icon={<Target className="h-4 w-4" />}>
                <div className="space-y-2.5">
                  <Select value={lead.source} onValueChange={handleSourceChange} disabled={saving}>
                    <SelectTrigger className="h-9" data-testid="source-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="flex gap-2 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    A webinar signup is warm and time-sensitive; a general website form usually needs a qualifying call first.
                  </p>
                </div>
              </InfoCard>

              <InfoCard title="Activity" icon={<History className="h-4 w-4" />} description="Everything that has happened on this lead">
                <ActivityTimeline activities={lead.activities ?? []} />
              </InfoCard>
            </div>

            {/* ----------------------------------------------------------- */}
            {/*  Sidebar — Pipeline command centre                           */}
            {/* ----------------------------------------------------------- */}
            <aside className="lg:sticky lg:top-16 lg:self-start">
              <div className="space-y-5">
                <Card className="overflow-hidden border-border/60 shadow-sm">
                  {/* Header — with live progress meta */}
                  <CardHeader
                    className="relative border-b px-5 pb-4 pt-5"
                    style={{
                      background: `linear-gradient(135deg, ${statusColor}10 0%, transparent 70%)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md"
                            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </div>
                          Lead Pipeline
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          Track every stage from new lead to final outcome.
                        </CardDescription>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 px-5 pb-6 pt-5">
                    {/* --- Horizontal stepper --- */}
                    <HorizontalStepper
                      status={lead.status}
                      statusHistory={lead.status_history}
                      onSelect={handleStatusChange}
                      saving={saving}
                    />

                    {/* --- Next best action --- */}
                    {nextStage ? (
                      <div
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: `${LEAD_STATUS_COLORS[nextStage]}30`,
                          background: `linear-gradient(135deg, ${LEAD_STATUS_COLORS[nextStage]}08, transparent)`,
                        }}
                      >
                        <div className="mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" style={{ color: LEAD_STATUS_COLORS[nextStage] }} />
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: LEAD_STATUS_COLORS[nextStage] }}
                          >
                            Next best action
                          </span>
                        </div>
                        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                          {STATUS_META[lead.status].tip}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(nextStage)}
                          disabled={saving}
                          className="h-8 w-full text-xs font-semibold"
                          style={{ backgroundColor: LEAD_STATUS_COLORS[nextStage], color: "#fff" }}
                          data-testid="next-action-btn"
                        >
                          {STATUS_META[lead.status].nextLabel}
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : lead.status === "QUALIFIED" ? (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Flag className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                            Ready for pipeline
                          </span>
                        </div>
                        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                          This lead is qualified. Create a deal to move it into your sales pipeline.
                        </p>
                        <Button
                          size="sm"
                          className="h-8 w-full bg-green-600 text-xs font-semibold text-white hover:bg-green-700"
                          onClick={() => navigate(`/${tenantSlug}/deals/new?leadId=${lead.id}`)}
                          data-testid="create-deal-btn"
                        >
                          Create deal
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                        <div className="mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                            Lead closed
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          This lead is no longer active. Leave a note explaining why so future outreach isn't duplicated.
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* --- Manual override select --- */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          Manually set status
                        </label>
                        <span className="text-[10px] text-muted-foreground">
                          Advanced
                        </span>
                      </div>

                      <Select value={lead.status} onValueChange={handleStatusChange} disabled={saving}>
                        <SelectTrigger className="h-9 bg-background" data-testid="status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((stage) => {
                            const currentIdx = LEAD_STATUSES.indexOf(lead.status);
                            const stageIdx = LEAD_STATUSES.indexOf(stage);
                            const isBackward = stageIdx < currentIdx && stage !== "DISQUALIFIED";

                            return (
                              <SelectItem
                                key={stage}
                                value={stage}
                                disabled={isBackward}
                                title={isBackward ? "Cannot move backward" : undefined}
                              >
                                <span className="flex items-center gap-2">
                                  {STATUS_META[stage].icon}
                                  <span>{titleCase(stage)}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* --- Rich vertical journey --- */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold">Journey</span>
                        <Badge variant="outline" className="h-5 rounded-full px-2 text-[10px]">
                          {(lead.status_history?.length ?? 1)} stage{(lead.status_history?.length ?? 1) === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <OrderStatusTimeline status={lead.status} statusHistory={lead.status_history} />
                    </div>
                  </CardContent>
                </Card>

                {/* Data privacy */}
                <Card className="border-border/60">
                  <CardHeader className="px-4 pb-2 pt-4">
                    <CardTitle className="flex items-center gap-2 text-md font-semibold">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Data privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground">
                      Only people in your workspace can see this lead's contact details.
                      Deleting a lead removes it permanently and cannot be undone.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </section>
        </div>

        {/* Dialogs */}
        <AssignLeadDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          leadId={lead.id}
          currentAssignee={lead.assignee}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{fullName || "this lead"}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} data-testid="delete-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="delete-confirm"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default LeadDetailPage;
