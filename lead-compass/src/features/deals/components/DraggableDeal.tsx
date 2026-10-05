import { memo, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Deal } from "@/features/deals/deal.types";
import type { AIDealHealthAnalysis } from "@/features/ai/apis/ai.api";
import DealCard from "@/features/deals/components/DealCard";

interface DraggableDealProps {
  deal: Deal;
  tenantSlug: string;
  stageName: string;
  health?: AIDealHealthAnalysis;
  isAnalyzing?: boolean;
  onAnalyze: (deal: Deal, stageName: string) => void;
}

function DraggableDeal({
  deal,
  tenantSlug,
  stageName,
  health,
  isAnalyzing,
  onAnalyze,
}: DraggableDealProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });
  const handleAnalyze = useCallback(() => {
    onAnalyze(deal, stageName);
  }, [deal, onAnalyze, stageName]);

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? "opacity-30" : ""}>
      <DealCard
        deal={deal}
        tenantSlug={tenantSlug}
        health={health}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
      />
    </div>
  );
}

export default memo(DraggableDeal);
