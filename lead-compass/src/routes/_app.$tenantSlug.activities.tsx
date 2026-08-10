import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    activitiesSelectors, fetchActivities, completeActivity,
    selectActivitiesLoading,
} from "@/features/activities/slice";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import {
    Phone, Mail, Users, CheckSquare, StickyNote,
    CheckCircle2, Circle, AlertCircle, Building2,
} from "lucide-react";
import { toast } from "sonner";
import type { Activity, ActivityStatus, ActivityType, ActivityPriority } from "@/features/activities/types";

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

export function ActivitiesPage() {
    const dispatch = useAppDispatch();
    const items = useAppSelector(activitiesSelectors.selectAll);
    const loading = useAppSelector(selectActivitiesLoading);
    const [filter, setFilter] = useState<Filter>("open");

      const { tenantSlug = "" } = useParams();
    
    useEffect(() => {
        dispatch(fetchActivities({}));
    }, [dispatch]);

    const filtered = items.filter((a) => {
        if (filter === "open") return a.status === "PENDING" || a.status === "IN_PROGRESS";
        if (filter === "completed") return a.status === "COMPLETED" || a.status === "CANCELLED";
        return true;
    });

    const openCount = items.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length;

    const handleComplete = async (activity: Activity) => {
        try {
            await dispatch(completeActivity(activity.id)).unwrap();
            toast.success("Marked as completed");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update activity");
        }
    };

    return (
        <div>
            <PageHeader
                title="Activities"
                description="Tasks and follow-ups across deals, contacts, and companies."
            />
            <div className="p-6">
                <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1 text-sm w-fit">
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

                {loading && !items.length ? (
                    <TableSkeleton />
                ) : !filtered.length ? (
                    <EmptyState
                        title="No activities"
                        description="Activities created by your team will appear here."
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((a) => {
                            const overdue = isOverdue(a);
                            const done = a.status === "COMPLETED" || a.status === "CANCELLED";

                            return (
                                <Card key={a.id} className={overdue ? "border-red-200" : undefined}>
                                    <CardContent className="flex items-start gap-3 p-4">
                                        <button
                                            onClick={() => !done && handleComplete(a)}
                                            disabled={done}
                                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-600 disabled:hover:text-muted-foreground"
                                            aria-label={done ? "Completed" : "Mark as complete"}
                                        >
                                            {a.status === "COMPLETED" ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-muted-foreground">{TYPE_ICON[a.entityType]}</span>
                                                <strong className={done ? "text-muted-foreground line-through" : ""}>
                                                    {a.title}
                                                </strong>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[11px]"
                                                    style={{ backgroundColor: `${STATUS_COLOR[a.status]}1a`, color: STATUS_COLOR[a.status] }}
                                                >
                                                    {a.status.replace("_", " ")}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[11px]"
                                                    style={{ borderColor: PRIORITY_COLOR[a.priority], color: PRIORITY_COLOR[a.priority] }}
                                                >
                                                    {a.priority}
                                                </Badge>
                                                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                                                    {overdue && <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
                                                    <span className={overdue ? "font-medium text-red-600" : ""}>
                                                        Due {new Date(a.due_date).toLocaleDateString()}
                                                    </span>
                                                </span>
                                            </div>

                                            {a.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                    {a.description}
                                                </p>
                                            )}

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <Link
                                                    to={`/${tenantSlug}/deals/${a.deal_id}`}
                                                    className="flex items-center gap-1 hover:text-foreground hover:underline"
                                                >
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    View deal
                                                </Link>
                                                {a.assignee && <span>Assigned to {a.assignee.full_name}</span>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}