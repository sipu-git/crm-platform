import { cn } from "@/lib/utils";
import { CommunicationChannel } from "@/features/communications/communication.types";
import { CHANNEL_META, CHANNEL_ORDER } from "@/utils/constants";

export function ChannelFilterBar({
  filter,
  onFilterChange,
  total,
  counts,
}: {
  filter: CommunicationChannel | "ALL";
  onFilterChange: (f: CommunicationChannel | "ALL") => void;
  total: number;
  counts: Map<CommunicationChannel, number>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-3">
      <button
        type="button"
        onClick={() => onFilterChange("ALL")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          filter === "ALL" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
        )}
      >
        All · {total}
      </button>
      {CHANNEL_ORDER.map((value) => {
        const meta = CHANNEL_META[value];
        const count = counts.get(value) ?? 0;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            disabled={count === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40",
              filter === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.tint }} />
            {meta.label}
            {count > 0 && <span className="tabular-nums opacity-70">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}