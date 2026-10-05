import { TableSkeleton } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";

export function KanbanCardSkeleton() {
  return (
    <div className="space-y-2.5 rounded-md border bg-card p-3 shadow-sm">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton({ cards }: { cards: number }) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="min-h-[120px] space-y-2 p-2">
        {Array.from({ length: cards }).map((_, index) => (
          <KanbanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  const columnCardCounts = [3, 2, 1, 2, 1];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columnCardCounts.map((cardCount, index) => (
        <KanbanColumnSkeleton key={index} cards={cardCount} />
      ))}
    </div>
  );
}

export function DealsTableSkeleton() {
  return <TableSkeleton rows={4} cols={5} />;
}
