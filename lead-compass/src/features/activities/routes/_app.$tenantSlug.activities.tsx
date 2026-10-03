import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
// import { useQueryClient } from "@tanstack/react-query";
// import { io } from "socket.io-client";
import {
    Phone, Mail, Users, CheckSquare, StickyNote, CheckCircle2, Circle,
    AlertCircle, Building2, Search, ChevronDown, X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { useActivities, useActivityMutation, useOwnActivities } from "@/features/activities/hooks/useActivities";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import type { Activity, ActivityType, ActivityPriority } from "@/features/activities/types/activities.types";

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
    CALL: <Phone className="h-4 w-4" />,
    EMAIL: <Mail className="h-4 w-4" />,
    MEETING: <Users className="h-4 w-4" />,
    TASK: <CheckSquare className="h-4 w-4" />,
    NOTE: <StickyNote className="h-4 w-4" />,
};

const PRIORITY_DOT: Record<ActivityPriority, string> = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
};

type BucketKey = "overdue" | "today" | "week" | "later" | "done";

const BUCKETS: { key: BucketKey; label: string; tone: string }[] = [
    { key: "overdue", label: "Overdue", tone: "text-red-600" },
    { key: "today", label: "Today", tone: "text-blue-600" },
    { key: "week", label: "This week", tone: "text-foreground" },
    { key: "later", label: "Later", tone: "text-muted-foreground" },
    { key: "done", label: "Completed", tone: "text-muted-foreground" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isDone = (a: Activity) => a.status === "COMPLETED" || a.status === "CANCELLED";

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
}

function bucketOf(a: Activity, now: number): BucketKey {
    if (isDone(a)) return "done";
    const due = new Date(a.due_date).getTime();
    const today = startOfDay(new Date(now));
    const DAY = 86_400_000;
    if (due < now && due < today + DAY && startOfDay(new Date(due)) < today) return "overdue";
    if (due < now) return "overdue";
    if (due < today + DAY) return "today";
    if (due < today + 7 * DAY) return "week";
    return "later";
}

function relativeDue(a: Activity, now: number) {
    const due = new Date(a.due_date).getTime();
    const diffDays = Math.round((startOfDay(new Date(due)) - startOfDay(new Date(now))) / 86_400_000);
    const time = new Date(due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Tomorrow, ${time}`;
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return new Date(due).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/** Re-render every `ms` so overdue/today buckets stay correct without a refetch. */
function useNow(ms = 60_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(id);
    }, [ms]);
    return now;
}

// function useActivityRealtime(tenantSlug: string) {
//     const qc = useQueryClient();
//     const [connected, setConnected] = useState(false);

//     useEffect(() => {
//         const socket = io(import.meta.env.VITE_API_URL, {
//             withCredentials: true,
//             query: { tenant: tenantSlug },
//             transports: ["websocket"],
//         });

//         const refresh = () => qc.invalidateQueries({ queryKey: ["activities"] });

//         socket.on("connect", () => { setConnected(true); refresh(); }); // catch up after reconnect
//         socket.on("disconnect", () => setConnected(false));
//         socket.on("activity:created", refresh);
//         socket.on("activity:updated", refresh);
//         socket.on("activity:deleted", refresh);

//         return () => { socket.disconnect(); };
//     }, [tenantSlug, qc]);

//     // Fallback polling while disconnected
//     useEffect(() => {
//         if (connected) return;
//         const id = setInterval(() => qc.invalidateQueries({ queryKey: ["activities"] }), 30_000);
//         return () => clearInterval(id);
//     }, [connected, qc]);

//     return connected;
// }

/** Returns ids that appeared or changed since the previous render, for ~3s. */
function useRecentlyChanged(items: Activity[]) {
    const prev = useRef<Map<string, string> | null>(null);
    const [flash, setFlash] = useState<Set<string>>(new Set());

    useEffect(() => {
        const sig = (a: Activity) => `${a.status}|${a.title}|${a.priority}|${a.due_date}|${a.assignee?.full_name ?? ""}`;
        const next = new Map(items.map((a) => [a.id, sig(a)]));
        if (prev.current) {
            const changed = new Set<string>();
            next.forEach((s, id) => { if (prev.current!.get(id) !== s) changed.add(id); });
            if (changed.size) {
                setFlash(changed);
                const t = setTimeout(() => setFlash(new Set()), 3000);
                prev.current = next;
                return () => clearTimeout(t);
            }
        }
        prev.current = next;
    }, [items]);

    return flash;
}
export function ActivitiesPage() {
    const auth = useAuthPayload();
    const { tenantSlug = "" } = useParams();
    const isSaleRep = auth?.user.role === "SALES_REP";

    const allQuery = useActivities(undefined, !isSaleRep);
    const ownQuery = useOwnActivities(isSaleRep);
    const { data: items = [], isLoading, isError } = isSaleRep ? ownQuery : allQuery;

    const { complete } = useActivityMutation();
    // const live = useActivityRealtime(tenantSlug);
    const flash = useRecentlyChanged(items);
    const now = useNow();

    const [query, setQuery] = useState("");
    const [focus, setFocus] = useState<BucketKey | null>(null);
    const [types, setTypes] = useState<Set<ActivityType>>(new Set());
    const [showDone, setShowDone] = useState(false);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    const grouped = useMemo(() => {
        const q = query.trim().toLowerCase();
        const out: Record<BucketKey, Activity[]> = { overdue: [], today: [], week: [], later: [], done: [] };
        for (const a of items) {
            if (types.size && !types.has(a.entityType)) continue;
            if (q && !`${a.title} ${a.description ?? ""} ${a.assignee?.full_name ?? ""}`.toLowerCase().includes(q)) continue;
            out[bucketOf(a, now)].push(a);
        }
        const byDue = (x: Activity, y: Activity) => new Date(x.due_date).getTime() - new Date(y.due_date).getTime();
        (Object.keys(out) as BucketKey[]).forEach((k) => out[k].sort(k === "done" ? (x, y) => byDue(y, x) : byDue));
        return out;
    }, [items, query, types, now]);

    const handleComplete = async (a: Activity) => {
        setPendingIds((s) => new Set(s).add(a.id));
        try {
            await complete.mutateAsync(a.id);
            toast.success("Marked as completed");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update activity");
        } finally {
            setPendingIds((s) => { const n = new Set(s); n.delete(a.id); return n; });
        }
    };

    const toggleType = (t: ActivityType) =>
        setTypes((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });

    const visible = BUCKETS.filter((b) => (focus ? b.key === focus : true));
    const totalShown = visible.reduce((n, b) => n + grouped[b.key].length, 0);

    return (
        <div>
            <PageHeader
                title={isSaleRep ? "My activities" : "Activities"}
                description={isSaleRep ? "Tasks assigned to you or created by you." : "Tasks and follow-ups across deals, contacts, and companies."}
            />

            <div className="mx-auto max-w-4xl space-y-5 p-6">
                {isError && <p role="alert" className="text-sm text-destructive">Could not load activities. Please try again.</p>}

                {/* Summary cards (click to focus, click again to clear) */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(["overdue", "today", "week", "done"] as BucketKey[]).map((k) => {
                        const b = BUCKETS.find((x) => x.key === k)!;
                        const active = focus === k;
                        return (
                            <button
                                key={k}
                                onClick={() => { setFocus(active ? null : k); if (k === "done") setShowDone(true); }}
                                className={`rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50 ${active ? "border-primary bg-muted" : ""}`}
                            >
                                <div className="text-xs text-muted-foreground">{b.label}</div>
                                <div className={`text-2xl font-semibold ${k === "overdue" && grouped.overdue.length ? "text-red-600" : ""}`}>
                                    {grouped[k].length}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Toolbar: search + type chips + live indicator */}
                <div className="flex bg-card p-3 rounded-md flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search title, description, assignee…"
                            className="pl-8"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {(Object.keys(TYPE_ICON) as ActivityType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => toggleType(t)}
                                title={t}
                                aria-pressed={types.has(t)}
                                className={`rounded-md border p-2 transition-colors ${types.has(t) ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {TYPE_ICON[t]}
                            </button>
                        ))}
                        {(types.size > 0 || focus || query) && (
                            <button
                                onClick={() => { setTypes(new Set()); setFocus(null); setQuery(""); }}
                                className="ml-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3" /> Clear
                            </button>
                        )}
                    </div>
                    {/* <span className="flex items-center gap-1.5 text-xs text-muted-foreground" title={live ? "Real-time updates on" : "Reconnecting, refreshing every 30s"}>
                        <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
                        {live ? "Live" : "Syncing"}
                    </span> */}
                </div>

                {/* Grouped list */}
                {isLoading && !items.length ? (
                    <TableSkeleton />
                ) : totalShown === 0 ? (
                    <EmptyState
                        title="No activities"
                        description={query || types.size || focus ? "Nothing matches your filters." : "Activities created by your team will appear here."}
                    />
                ) : (
                    <div className="space-y-6">
                        {visible.map((b) => {
                            const list = grouped[b.key];
                            if (!list.length) return null;
                            const collapsible = b.key === "done";
                            const open = !collapsible || showDone || focus === "done";

                            return (
                                <section key={b.key}>
                                    <button
                                        disabled={!collapsible}
                                        onClick={() => setShowDone((s) => !s)}
                                        className="mb-2 flex w-full items-center bg-card p-3 gap-2 text-left"
                                    >
                                        <h2 className={`text-sm font-semibold ${b.tone}`}>{b.label}</h2>
                                        <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{list.length}</span>
                                        {collapsible && (
                                            <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                                        )}
                                    </button>

                                    {open && (
                                        <ul className="divide-y rounded-lg border">
                                            {list.map((a) => (
                                                <ActivityRow
                                                    key={a.id}
                                                    a={a}
                                                    now={now}
                                                    tenantSlug={tenantSlug}
                                                    flashing={flash.has(a.id)}
                                                    pending={pendingIds.has(a.id)}
                                                    onComplete={handleComplete}
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityRow({
    a, now, tenantSlug, flashing, pending, onComplete,
}: {
    a: Activity; now: number; tenantSlug: string; flashing: boolean; pending: boolean;
    onComplete: (a: Activity) => void;
}) {
    const done = isDone(a);
    const overdue = !done && new Date(a.due_date).getTime() < now;

    return (
        <li className={`flex items-start gap-3 px-4 bg-card py-3 transition-colors duration-700 ${flashing ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}>
            <button
                onClick={() => !done && !pending && onComplete(a)}
                disabled={done || pending}
                aria-label={done ? "Completed" : "Mark as complete"}
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-600 disabled:cursor-default disabled:hover:text-muted-foreground"
            >
                {a.status === "COMPLETED" || pending
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    : <Circle className="h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">{TYPE_ICON[a.entityType]}</span>
                    <span className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>{a.title}</span>
                    {a.status === "IN_PROGRESS" && <Badge variant="secondary" className="text-[11px]">In progress</Badge>}
                    {a.status === "CANCELLED" && <Badge variant="outline" className="text-[11px]">Cancelled</Badge>}
                    {flashing && <Badge className="text-[10px]">Updated</Badge>}
                </div>

                {a.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{a.description}</p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[a.priority]}`} title={`${a.priority} priority`} />
                        {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
                    </span>
                    <span className={`flex items-center gap-1 ${overdue ? "font-medium text-red-600" : ""}`}>
                        {overdue && <AlertCircle className="h-3.5 w-3.5" />}
                        {relativeDue(a, now)}
                    </span>
                    {a.assignee && <span>{a.assignee.full_name}</span>}
                    <Link
                        to={`/${tenantSlug}/deals/${a.deal_id}`}
                        className="ml-auto flex items-center gap-1 hover:text-foreground hover:underline"
                    >
                        <Building2 className="h-3.5 w-3.5" /> View deal
                    </Link>
                </div>
            </div>
        </li>
    );
}