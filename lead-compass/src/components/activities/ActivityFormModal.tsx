import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Mail, Users, CheckSquare, StickyNote, User, CalendarClock } from "lucide-react";
import { Activity, ACTIVITY_PRIORITIES, ACTIVITY_TYPES, ActivityPriority, ActivityType } from "@/features/activities/types";
import { fetchAssignees, selectAssignees, selectAssigneesLoading } from "@/features/leads/service2/slice";
import { createActivity, updateActivity } from "@/features/activities/slice";
import {
    activityFormSchema, validateActivityForm, ACTIVITY_FORM_DEFAULTS, type ActivityFormValues, type ActivityFormErrors,
} from "@/features/activities/activity.validate";

interface ActivityFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dealId: string;
    contactId: string;
    companyId: string;
    activity?: Activity | null;
    defaultAssigneeId?: string | null;
}

const TYPE_META: Record<ActivityType, { label: string; icon: React.ReactNode }> = {
    CALL: { label: "Call", icon: <Phone className="h-3.5 w-3.5" /> },
    EMAIL: { label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
    MEETING: { label: "Meeting", icon: <Users className="h-3.5 w-3.5" /> },
    TASK: { label: "Task", icon: <CheckSquare className="h-3.5 w-3.5" /> },
    NOTE: { label: "Note", icon: <StickyNote className="h-3.5 w-3.5" /> },
};

const PRIORITY_META: Record<ActivityPriority, { label: string; color: string }> = {
    LOW: { label: "Low", color: "#64748b" },
    MEDIUM: { label: "Medium", color: "#eab308" },
    HIGH: { label: "High", color: "#ef4444" },
};

function toDateInputValue(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 10);
}

function toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
}

const DUE_DATE_PRESETS = [
    { label: "Today", getValue: () => toDateOnly(new Date()) },
    { label: "Tomorrow", getValue: () => toDateOnly(new Date(Date.now() + 86_400_000)) },
    { label: "Next week", getValue: () => toDateOnly(new Date(Date.now() + 7 * 86_400_000)) },
];

function activityToFormValues(activity?: Activity | null): ActivityFormValues {
    if (!activity) return ACTIVITY_FORM_DEFAULTS;
    return {
        title: activity.title,
        description: activity.description ?? "",
        type: activity.entityType, // API response uses entityType (Prisma column name)
        priority: activity.priority,
        dueDate: toDateInputValue(activity.due_date),
        assignedTo: activity.assigned_to ?? "",
    };
}

export function ActivityFormDialog({
    open, onOpenChange, dealId, contactId, companyId, activity, defaultAssigneeId
}: ActivityFormDialogProps) {
    const dispatch = useAppDispatch();
    const assignees = useAppSelector(selectAssignees);
    const loadingAssignees = useAppSelector(selectAssigneesLoading);
    const isEdit = !!activity;

    // Single source of truth for the form, typed against the same schema
    // used to validate and submit it — no per-field useState to drift out
    // of sync with each other.
    const [values, setValues] = useState<ActivityFormValues>(ACTIVITY_FORM_DEFAULTS);
    const [errors, setErrors] = useState<ActivityFormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ActivityFormValues, boolean>>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        dispatch(fetchAssignees());
        setValues(activityToFormValues(activity));
        setErrors({});
        setTouched({});
    }, [open, activity, dispatch]);

    const updateField = <K extends keyof ActivityFormValues>(field: K, value: ActivityFormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const markTouched = (field: keyof ActivityFormValues) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const fieldError = (field: keyof ActivityFormValues) =>
        touched[field] ? errors[field] : undefined;

    const handleSubmit = async () => {
        const validationErrors = validateActivityForm(values);
        setErrors(validationErrors);
        setTouched({
            title: true, description: true, type: true,
            priority: true, dueDate: true, assignedTo: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            toast.error(Object.values(validationErrors)[0]);
            return;
        }

        const payload = activityFormSchema.parse(values);

        setSaving(true);
        try {
            if (isEdit && activity) {
                await dispatch(
                    updateActivity({
                        id: activity.id,
                        data: {
                            title: payload.title,
                            description: payload.description ?? "",
                            type: payload.type,
                            priority: payload.priority,
                            dueDate: new Date(payload.dueDate).toISOString(),
                            assignedTo: payload.assignedTo || undefined,
                        },
                    })
                ).unwrap();
                toast.success("Activity updated");
            } else {
                await dispatch(
                    createActivity({
                        dealId,
                        contactId,
                        companyId,
                        title: payload.title,
                        description: payload.description ?? "",
                        type: payload.type,
                        priority: payload.priority,
                        dueDate: new Date(payload.dueDate).toISOString(),
                        assignedTo: payload.assignedTo || undefined,
                    })
                ).unwrap();
                toast.success("Activity created");
            }
            onOpenChange(false);
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to save activity");
        } finally {
            setSaving(false);
        }
    };

    const titleError = fieldError("title");
    const dueDateError = fieldError("dueDate");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit activity" : "New activity"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update the details for this task or follow-up." : "Add a call, email, meeting, task, or note to this deal."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Type</Label>
                            <Select value={values.type} onValueChange={(v) => updateField("type", v as ActivityType)} disabled={saving}>
                                <SelectTrigger>
                                    <SelectValue>
                                        <span className="flex items-center gap-2">
                                            {TYPE_META[values.type].icon}
                                            {TYPE_META[values.type].label}
                                        </span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVITY_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            <span className="flex items-center gap-2">
                                                {TYPE_META[t].icon}
                                                {TYPE_META[t].label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Priority</Label>
                            <Select value={values.priority} onValueChange={(v) => updateField("priority", v as ActivityPriority)} disabled={saving}>
                                <SelectTrigger>
                                    <SelectValue>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: PRIORITY_META[values.priority].color }}
                                            />
                                            {PRIORITY_META[values.priority].label}
                                        </span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVITY_PRIORITIES.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: PRIORITY_META[p].color }}
                                                />
                                                {PRIORITY_META[p].label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                            placeholder="e.g. Follow up on proposal"
                            value={values.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            onBlur={() => markTouched("title")}
                            disabled={saving}
                            autoFocus
                            aria-invalid={!!titleError}
                            className={titleError ? "border-red-400 focus-visible:ring-red-400" : undefined}
                        />
                        {titleError && <p className="text-xs text-red-600">{titleError}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                            placeholder="Add any context — what needs to happen, decisions made, next steps…"
                            value={values.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            disabled={saving}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Due date</Label>
                            <Input
                                type="date"
                                value={values.dueDate}
                                onChange={(e) => updateField("dueDate", e.target.value)}
                                onBlur={() => markTouched("dueDate")}
                                disabled={saving}
                                aria-invalid={!!dueDateError}
                                className={dueDateError ? "border-red-400 focus-visible:ring-red-400" : undefined}
                            />
                            {dueDateError ? (
                                <p className="text-xs text-red-600">{dueDateError}</p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {DUE_DATE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => updateField("dueDate", preset.getValue())}
                                            disabled={saving}
                                            className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Assignee</Label>
                            <Select
                                value={values.assignedTo || "__unassigned"}
                                onValueChange={(v) => updateField("assignedTo", v === "__unassigned" ? "" : v)}
                                disabled={saving || loadingAssignees}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingAssignees ? "Loading…" : "Unassigned"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__unassigned">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            Unassigned
                                        </span>
                                    </SelectItem>
                                    {(assignees ?? []).map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            <div className="flex flex-col">
                                                <span>{a.full_name}</span>
                                                {a.designation && (
                                                    <span className="text-[11px] text-muted-foreground">{a.designation}</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {values.dueDate && (
                        <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Due {new Date(values.dueDate).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Create activity"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}