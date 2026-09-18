import { format } from "date-fns";
import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Communication } from "@/features/communications/communication.types";
import { CHANNEL_META } from "../../utils/constants";
import { StatusTicks } from "./StatusTicks";

export function MessageBubble({item,leadFirstName}: {
  item: Communication;
  leadFirstName?: string;
}) {
  const meta = CHANNEL_META[item.channel];
  const Icon = meta.icon;
  const outbound = item.direction === "OUTBOUND";
  const isNote = item.channel === "INTERNAL_NOTE";

  if (isNote) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%] rounded-xl border border-dashed bg-muted/50 px-3 py-2 text-xs">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-muted-foreground">
            <StickyNote className="h-3 w-3" /> Internal note
          </div>
          <p className="whitespace-pre-wrap text-foreground/80">{item.body}</p>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {format(new Date(item.created_at), "h:mm a")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-md px-3.5 py-2.5 text-sm sm:max-w-[70%]",
          outbound
            ? "rounded-br-sm border border-primary/25 bg-foreground text-background shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl backdrop-saturate-150 dark:bg-primary/15 dark:text-foreground dark:backdrop-brightness-50"
            : "rounded-bl-sm border bg-card/70 text-card-foreground shadow-sm backdrop-blur-md",
          outbound && item.status === "FAILED" && "ring-1 dark:ring-foreground/10",
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
            outbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
          style={{ color: outbound ? undefined : meta.tint }}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
          <span className="opacity-70">· {outbound ? "You" : (leadFirstName ?? "Lead")}</span>
        </div>
        {item.subject && <p className="mb-1 font-semibold">{item.subject}</p>}
        <p className="whitespace-pre-wrap leading-relaxed">{item.body}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            outbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{format(new Date(item.created_at), "h:mm a")}</span>
          {outbound && <StatusTicks status={item.status} />}
        </div>
      </div>
    </div>
  );
}