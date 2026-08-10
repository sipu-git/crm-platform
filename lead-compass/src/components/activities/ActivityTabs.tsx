import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Phone, Mail, Users, CheckSquare, StickyNote, Plus, MoreVertical,
    CheckCircle2, Circle, Trash2, Pencil, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
    fetchActivities, completeActivity, deleteActivity, selectActivitiesByDeal, selectActivitiesLoading,
} from "@/features/activities/slice";
import type { Activity, ActivityStatus, ActivityType, ActivityPriority } from "@/features/activities/types";
import { ActivityFormDialog } from "./ActivityFormModal";

interface ActivityTabProps {
    dealId: string;
    contactId: string;
    companyId: string;
    defaultAssigneeId?: string | null;
}

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
    CALL: <Phone className="h-4 w-4" />,
    EMAIL: <Mail className="h-4 w-4" />,
    MEETING: <Users className="h-4 w-4" />,
    TASK: <CheckSquare className="h-4 w-4" />,
    NOTE: <StickyNote className="h-4 w-4" />,
};

const STATUS_COLOR: Record<ActivityStatus, string> = {
    PENDING: "#64748b",
    IN_PROGRESS: "#3b82f6",
    COMPLETED: "#22c55e",
    CANCELLED: "#ef4444",
};

const PRIORITY_COLOR: Record<ActivityPriority, string> = {
    LOW: "#64748b",
    MEDIUM: "#eab308",
    HIGH: "#ef4444",
};

type Filter = "open" | "completed" | "all";

function isOverdue(activity: Activity) {
    return (
        activity.status !== "COMPLETED" &&
        activity.status !== "CANCELLED" &&
        new Date(activity.due_date).getTime() < Date.now()
    );
}

export function ActivityTab({ dealId, contactId, companyId,defaultAssigneeId }: ActivityTabProps) {
    const dispatch = useAppDispatch();

    const byDealSelector = useMemo(() => selectActivitiesByDeal(dealId), [dealId]);
    const activities = useAppSelector(byDealSelector);
    const loading = useAppSelector(selectActivitiesLoading);

    const [filter, setFilter] = useState<Filter>("open");
    const [formOpen, setFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    useEffect(() => {
        dispatch(fetchActivities({ dealId }));
    }, [dispatch, dealId]);

    const filtered = activities.filter((a) => {
        if (filter === "open") return a.status === "PENDING" || a.status === "IN_PROGRESS";
        if (filter === "completed") return a.status === "COMPLETED" || a.status === "CANCELLED";
        return true;
    });

    const openCount = activities.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length;

    const handleComplete = async (activity: Activity) => {
        try {
            await dispatch(completeActivity(activity.id)).unwrap();
            toast.success("Marked as completed");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update activity");
        }
    };

    const handleDelete = async (activity: Activity) => {
        try {
            await dispatch(deleteActivity(activity.id)).unwrap();
            toast.success("Activity deleted");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to delete activity");
        }
    };

    const openCreate = () => {
        setEditingActivity(null);
        setFormOpen(true);
    };

    const openEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setFormOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Header: filter tabs + new activity */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
                    {([
                        { key: "open", label: `Open${openCount ? ` (${openCount})` : ""}` },
                        { key: "completed", label: "Completed" },
                        { key: "all", label: "All" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${filter === tab.key
                                ? "bg-background shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    New activity
                </Button>
            </div>

            {/* List */}
            {loading && activities.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Loading activities…
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    {filter === "open" ? "No open activities. Nice and clear." : "Nothing here yet."}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((activity) => {
                        const overdue = isOverdue(activity);
                        const done = activity.status === "COMPLETED" || activity.status === "CANCELLED";

                        return (
                            <Card key={activity.id} className={overdue ? "border-red-200" : undefined}>
                                <CardContent className="flex items-start gap-3 py-3">
                                    <button
                                        onClick={() => !done && handleComplete(activity)}
                                        disabled={done}
                                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-600 disabled:hover:text-muted-foreground"
                                        aria-label={done ? "Completed" : "Mark as complete"}
                                    >
                                        {activity.status === "COMPLETED" ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <Circle className="h-5 w-5" />
                                        )}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-muted-foreground">{TYPE_ICON[activity.entityType]}</span>
                                            <span className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                                                {activity.title}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[11px]"
                                                style={{ backgroundColor: `${STATUS_COLOR[activity.status]}1a`, color: STATUS_COLOR[activity.status] }}
                                            >
                                                {activity.status.replace("_", " ")}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-[11px]"
                                                style={{ borderColor: PRIORITY_COLOR[activity.priority], color: PRIORITY_COLOR[activity.priority] }}
                                            >
                                                {activity.priority}
                                            </Badge>
                                        </div>

                                        {activity.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                {activity.description}
                                            </p>
                                        )}

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className={`flex items-center gap-1 ${overdue ? "font-medium text-red-600" : ""}`}>
                                                {overdue && <AlertCircle className="h-3.5 w-3.5" />}
                                                Due {new Date(activity.due_date).toLocaleDateString()}
                                                {overdue ? " · Overdue" : ""}
                                            </span>
                                            {activity.assignee && (
                                                <span>Assigned to {activity.assignee.full_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(activity)}>
                                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(activity)} className="text-red-600">
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <ActivityFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                dealId={dealId}
                contactId={contactId}
                companyId={companyId}
                activity={editingActivity}
                defaultAssigneeId={defaultAssigneeId}
            />
        </div>
    );
}