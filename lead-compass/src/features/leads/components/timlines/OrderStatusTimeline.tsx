import { memo } from "react";
import { Check, ThumbsDown } from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { StatusHistoryEntry } from "@/features/activities/utils/activity";
import { STATUS_META, titleCase, PIPELINE_STAGES } from "@/features/leads/components/status-meta";
import { LEAD_STATUS_COLORS, LeadStatus } from "@/features/leads/types/lead.types";

function getStageDuration(
    stage: LeadStatus,
    currentStatus: LeadStatus,
    statusHistory?: StatusHistoryEntry[],
): string | null {
    if (!statusHistory?.length) return null;

    const entered = statusHistory.find((h) => h.status === stage)?.changed_At;
    if (!entered) return null;

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

export const OrderStatusTimeline = memo(function OrderStatusTimeline({
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
        stage === "DISQUALIFIED" ? "#DC2626" : (STATUS_META as any)[stage] ? undefined : undefined;

    return (
        <ol className="relative" aria-label="Lead status timeline">
            {nodes.map((stage, index) => {
                const isTerminalBad = stage === "DISQUALIFIED";
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;
                const isLast = index === nodes.length - 1;
                const color = getStatusColorFor(stage);
                const timestamp = timestampFor(stage);
                const duration = getStageDuration(stage, status, statusHistory);

                return (
                    <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
                        {!isLast && (
                            <span
                                className="absolute left-[19px] top-10 h-[calc(100%-1.25rem)] w-[2px] rounded-full transition-all duration-500"
                                style={{
                                    background: isCompleted
                                        ? `linear-gradient(180deg, ${color}, ${getStatusColorFor(nodes[index + 1])})`
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
                                backgroundColor: isCompleted ? color : isCurrent ? `${color}15` : "hsl(var(--background))",
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

                                <span
                                    className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold"
                                    style={{
                                        backgroundColor: isCompleted || isCurrent ? `${color}15` : "hsl(var(--muted))",
                                        color: isCompleted || isCurrent ? color : "hsl(var(--muted-foreground))",
                                        border: isCompleted || isCurrent ? `1px solid ${color}35` : "1px solid hsl(var(--border))",
                                    }}
                                >
                                    {isCurrent ? (isTerminalBad ? "Exited" : "Current") : isCompleted ? "Completed" : "Upcoming"}
                                </span>

                                {duration && (
                                    <span className="inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium">
                                        {duration}
                                    </span>
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
                                <time className="mt-1.5 block text-[11px] font-medium text-muted-foreground/80" dateTime={timestamp}>
                                    {format(new Date(timestamp), "MMM d, yyyy · h:mm a")}
                                </time>
                            )}

                            {isCurrent && !isTerminalBad && (
                                <div
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
                                    style={{ backgroundColor: `${color}10`, color }}
                                >
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: color }} />
                                    Action in progress
                                </div>
                            )}

                            {isTerminalBad && isCurrent && (
                                <div className="mt-2 rounded-lg border px-3 py-2" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
                                    <div className="flex items-start gap-2">
                                        <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                                        <div>
                                            <p className="text-[11px] font-semibold" style={{ color }}>Final action</p>
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

    function getStatusColorFor(stage: LeadStatus) {
        return stage === "DISQUALIFIED" ? "#DC2626" : LEAD_STATUS_COLORS[stage];
    }
});