import { memo } from "react";
import { History } from "lucide-react";
import { format } from "date-fns";
import { LeadActivity, ACTIVITY_ICON } from "@/features/activities/utils/activity";
import InfoCard from "../InfoCard";

const TimelineItem = memo(function TimelineItem({
    activity,
    isLast,
}: {
    activity: LeadActivity;
    isLast: boolean;
}) {
    return (
        <li className="relative flex gap-3 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
                <span
                    className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border"
                    aria-hidden="true"
                />
            )}

            {/* Icon node */}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card text-muted-foreground shadow-sm">
                {ACTIVITY_ICON[activity.type]}
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <p className="text-sm font-medium leading-snug">{activity.label}</p>
                    <time
                        className="shrink-0 text-[11px] text-muted-foreground"
                        dateTime={activity.timestamp}
                    >
                        {format(new Date(activity.timestamp), "MMM d, yyyy · h:mm a")}
                    </time>
                </div>
                {activity.detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{activity.detail}</p>
                )}
                {activity.actor && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">by {activity.actor}</p>
                )}
            </div>
        </li>
    );
});

const ActivityTimeline = memo(function ActivityTimeline({
    activities,
}: {
    activities: LeadActivity[];
}) {
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
                <TimelineItem
                    key={activity.id}
                    activity={activity}
                    isLast={i === activities.length - 1}
                />
            ))}
        </ol>
    );
});

export function ActivityCard({ activities }: { activities: LeadActivity[] }) {
    return (
        <InfoCard
            title="Activity"
            icon={<History className="h-4 w-4 text-primary" />}
            description="Everything that has happened on this lead"
        >
            <ActivityTimeline activities={activities} />
        </InfoCard>
    );
}