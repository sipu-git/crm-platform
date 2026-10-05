import { lazy, Suspense, useState } from "react";
import { useParams } from "react-router-dom";
import { Kanban as KanbanIcon, Rows3 } from "lucide-react";
import { useDealBoard, useDeals } from "@/features/deals/hooks/useDeals";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { DealsTableSkeleton, KanbanSkeleton } from "@/features/deals/components/DealsSkeletons";

type ViewMode = "kanban" | "table";

const KanbanView = lazy(() => import("@/features/deals/components/KanbanView"));
const DealsTableView = lazy(() => import("@/features/deals/components/DealsTableView"));

export default function DealsPage() {
  const { tenantSlug = "" } = useParams();
  const [view, setView] = useState<ViewMode>("kanban");
  const { data: board = [], isLoading: boardLoading, isError: boardError } = useDealBoard();
  const {data: deals = [],isLoading: dealsLoading,isError: dealsError} = useDeals(undefined, { enabled: view === "table" });
  const loading = dealsLoading || boardLoading;

  return (
    <div>
      <PageHeader
        title="Deals"
        description="Track pipeline value across every stage."
        actions={
          <div className="flex overflow-hidden rounded-md border">
            <Button
              size="sm"
              variant={view === "kanban" ? "secondary" : "ghost"}
              className="rounded-none"
              onClick={() => setView("kanban")}
            >
              <KanbanIcon className="mr-2 h-4 w-4" />
              Kanban
            </Button>
            <Button
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              className="rounded-none border-l"
              onClick={() => setView("table")}
            >
              <Rows3 className="mr-2 h-4 w-4" />
              Table
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        {(dealsError || boardError) && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            Could not load deals. Please try again.
          </p>
        )}

        {loading &&
          deals.length === 0 &&
          board.length === 0 &&
          (view === "kanban" ? <KanbanSkeleton /> : <DealsTableSkeleton />)}

        {!loading && board.length === 0 && deals.length === 0 && (
          <EmptyState
            title="No deals yet"
            description="Deals are created automatically once a lead is marked Qualified."
          />
        )}

        {(board.length > 0 || deals.length > 0) && (
          <Suspense fallback={view === "kanban" ? <KanbanSkeleton /> : <DealsTableSkeleton />}>
            {view === "kanban" ? (
              <KanbanView tenantSlug={tenantSlug} board={board} />
            ) : (
              <DealsTableView deals={deals} tenantSlug={tenantSlug} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}
