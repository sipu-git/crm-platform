import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { useDealMutation } from "@/features/deals/hooks/useDeals";
import type { Deal, DealBoardColumn } from "@/features/deals/deal.types";
import { useEvaluateDealHealthMutation } from "@/features/ai/hooks/useAi";
import type { AIDealHealthAnalysis } from "@/features/ai/apis/ai.api";
import KanbanColumn from "@/features/deals/components/KanbanColumn";
import DealCard from "@/features/deals/components/DealCard";

interface KanbanViewProps {
  tenantSlug: string;
  board: DealBoardColumn[];
}

function KanbanView({ tenantSlug, board }: KanbanViewProps) {
  const { moveStage } = useDealMutation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [dragging, setDragging] = useState<Deal | null>(null);
  const [healthMap, setHealthMap] = useState<Record<string, AIDealHealthAnalysis>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(() => new Set());
  const evaluateHealth = useEvaluateDealHealthMutation();

  const healthMapRef = useRef(healthMap);
  const analyzingIdsRef = useRef(analyzingIds);
  healthMapRef.current = healthMap;
  analyzingIdsRef.current = analyzingIds;

  const allDeals = useMemo(() => board.flatMap((column) => column.deals), [board]);

  const analyzeDeal = useCallback(
    async (deal: Deal, stageName: string) => {
      if (analyzingIdsRef.current.has(deal.id) || healthMapRef.current[deal.id]) return;

      const nextAnalyzingIds = new Set(analyzingIdsRef.current);
      nextAnalyzingIds.add(deal.id);
      analyzingIdsRef.current = nextAnalyzingIds;
      setAnalyzingIds(nextAnalyzingIds);

      try {
        const daysInStage = deal.updated_at
          ? Math.max(
              1,
              Math.floor(
                (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24),
              ),
            )
          : 1;

        const result = await evaluateHealth.mutateAsync({
          dealName: deal.title,
          stage: stageName,
          amount: deal.amount,
          daysInStage,
          hasOverdueInvoice: false,
          lastActivityDaysAgo: daysInStage,
        });

        const nextHealthMap = { ...healthMapRef.current, [deal.id]: result };
        healthMapRef.current = nextHealthMap;
        setHealthMap(nextHealthMap);
      } catch {
        toast.error(`Failed to analyze "${deal.title}"`);
      } finally {
        const nextIds = new Set(analyzingIdsRef.current);
        nextIds.delete(deal.id);
        analyzingIdsRef.current = nextIds;
        setAnalyzingIds(nextIds);
      }
    },
    [evaluateHealth.mutateAsync],
  );

  const handleAnalyze = useCallback(
    (deal: Deal, stageName: string) => {
      void analyzeDeal(deal, stageName);
    },
    [analyzeDeal],
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = allDeals.find((item) => item.id === event.active.id);
      if (deal) setDragging(deal);
    },
    [allDeals],
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDragging(null);
      if (!event.over) return;

      const dealId = event.active.id as string;
      const targetStageId = event.over.id as string;
      const deal = allDeals.find((item) => item.id === dealId);
      if (!deal || deal.stage_id === targetStageId) return;

      try {
        await moveStage.mutateAsync({
          id: dealId,
          value: { stageId: targetStageId },
        });
      } catch (error) {
        toast.error(typeof error === "string" ? error : "Failed to move deal");
      }
    },
    [allDeals, moveStage.mutateAsync],
  );

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:snap-x sm:snap-mandatory">
        {board.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tenantSlug={tenantSlug}
            healthMap={healthMap}
            analyzingIds={analyzingIds}
            onAnalyze={handleAnalyze}
          />
        ))}
      </div>
      <DragOverlay>
        {dragging && <DealCard deal={dragging} tenantSlug={tenantSlug} dragging />}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(KanbanView);
