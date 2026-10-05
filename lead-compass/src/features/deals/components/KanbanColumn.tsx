import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { AIDealHealthAnalysis } from "@/features/ai/apis/ai.api";
import type { Deal, DealBoardColumn as DealBoardColumnType } from "@/features/deals/deal.types";
import DraggableDeal from "@/features/deals/components/DraggableDeal";
import { formatDealAmount } from "@/features/deals/components/deal-formatters";

interface KanbanColumnProps {
  column: DealBoardColumnType;
  tenantSlug: string;
  healthMap: Record<string, AIDealHealthAnalysis>;
  analyzingIds: Set<string>;
  onAnalyze: (deal: Deal, stageName: string) => void;
}

function KanbanColumn({
  column,
  tenantSlug,
  healthMap,
  analyzingIds,
  onAnalyze,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const total = column.deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 snap-start flex-col rounded-lg border bg-muted/30 transition-colors ${
        isOver ? "bg-primary/5 ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: column.is_won ? "#22c55e" : column.is_lost ? "#ef4444" : "#3b82f6",
            }}
          />
          <span className="text-sm font-semibold">{column.name}</span>
          <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {column.deals.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDealAmount(total)}</span>
      </div>
      <div className="min-h-[120px] space-y-2 p-2">
        {column.deals.map((deal) => (
          <DraggableDeal
            key={deal.id}
            deal={deal}
            tenantSlug={tenantSlug}
            stageName={column.name}
            health={healthMap[deal.id]}
            isAnalyzing={analyzingIds.has(deal.id)}
            onAnalyze={onAnalyze}
          />
        ))}
        {column.deals.length === 0 && (
          <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function areKanbanColumnPropsEqual(previous: KanbanColumnProps, next: KanbanColumnProps) {
  if (
    previous.column !== next.column ||
    previous.tenantSlug !== next.tenantSlug ||
    previous.onAnalyze !== next.onAnalyze
  ) {
    return false;
  }

  if (previous.healthMap === next.healthMap && previous.analyzingIds === next.analyzingIds) {
    return true;
  }

  return previous.column.deals.every(
    (deal) =>
      previous.healthMap[deal.id] === next.healthMap[deal.id] &&
      previous.analyzingIds.has(deal.id) === next.analyzingIds.has(deal.id),
  );
}

export default memo(KanbanColumn, areKanbanColumnPropsEqual);
