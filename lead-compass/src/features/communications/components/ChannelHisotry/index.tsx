import { forwardRef } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Communication, CommunicationChannel } from "@/features/communications/communication.types";
import { DayGroup } from "./DayGroup";
import { countByChannel, groupByDay } from "@/features/communications/utils/grouping";
import { ChannelFilterBar } from "./ChannelFilter";

export const ChatHistory = forwardRef<HTMLDivElement, {
    history: Communication[];
    filtered: Communication[];
    filter: CommunicationChannel | "ALL";
    onFilterChange: (f: CommunicationChannel | "ALL") => void;
    historyLoading: boolean;
    leadFirstName?: string;
}>(function ChatHistory({ history, filtered, filter, onFilterChange, historyLoading, leadFirstName }, scrollRef) {
    const counts = countByChannel(history);
    const grouped = groupByDay(filtered);

    return (
        <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border bg-card lg:h-[calc(100vh-8.5rem)]">
            <ChannelFilterBar filter={filter} onFilterChange={onFilterChange} total={history.length} counts={counts} />

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-background px-4 py-5 sm:px-6">
                {historyLoading && history.length === 0 && (
                    <div className="space-y-3" aria-hidden>
                        {[0, 1, 2].map((i) => (
                            <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
                                <div className="h-16 w-56 animate-pulse rounded-2xl bg-muted" />
                            </div>
                        ))}
                    </div>
                )}

                {!historyLoading && filtered.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Inbox className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="max-w-64 text-xs text-muted-foreground">
                            Pick a channel on the left to reach out — every message across WhatsApp, email,
                            SMS, calls, and notes shows up here in one timeline.
                        </p>
                    </div>
                )}

                {grouped.map((group) => (
                    <DayGroup key={group.label} label={group.label} items={group.items} leadFirstName={leadFirstName} />
                ))}
            </div>
        </div>
    );
});