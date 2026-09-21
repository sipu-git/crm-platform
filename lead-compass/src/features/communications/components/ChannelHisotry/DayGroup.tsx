import { Communication } from "@/features/communications/communication.types";
import { MessageBubble } from "../MessageBubble";

export function DayGroup({ label, items, leadFirstName,
}: {
    label: string;
    items: Communication[];
    leadFirstName?: string;
}) {
    return (
        <div className="space-y-3">
            <div className="sticky top-0 z-10 flex items-center justify-center">
                <span className="rounded-full border bg-card/90 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
                    {label}
                </span>
            </div>
            {items.map((item) => (
                <MessageBubble key={item.id} item={item} leadFirstName={leadFirstName} />
            ))}
        </div>
    );
}