// features/deals/pages/DealsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useDraggable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Kanban as KanbanIcon, Rows3, Building2, Calendar, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDeals, fetchDealBoard, moveDealStage, selectDeals, selectDealBoard, selectDealsLoading } from "@/features/deals/slice";
import type { Deal, DealBoardColumn } from "@/features/deals/deal.types";
import { PageHeader, TableSkeleton, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/hooks/use-format";

type ViewMode = "kanban" | "table";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DealsPage() {
  const { tenantSlug = "" } = useParams();
  const dispatch = useAppDispatch();
  const deals = useAppSelector(selectDeals);
  const board = useAppSelector(selectDealBoard);
  const loading = useAppSelector(selectDealsLoading);
  const [view, setView] = useState<ViewMode>("kanban");

  useEffect(() => {
    dispatch(fetchDealBoard());
    dispatch(fetchDeals());
  }, [dispatch]);

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
        {loading && deals.length === 0 && board.length === 0 && <TableSkeleton rows={4} cols={5} />}

        {!loading && board.length === 0 && deals.length === 0 && (
          <EmptyState
            title="No deals yet"
            description="Deals are created automatically once a lead is marked Qualified."
          />
        )}

        {(board.length > 0 || deals.length > 0) &&
          (view === "kanban" ? (
            <KanbanView tenantSlug={tenantSlug} board={board} />
          ) : (
            <TableView deals={deals} tenantSlug={tenantSlug} />
          ))}
      </div>
    </div>
  );
}

// ---------- Kanban ----------

function KanbanView({ tenantSlug, board }: { tenantSlug: string; board: DealBoardColumn[] }) {
  const dispatch = useAppDispatch();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [dragging, setDragging] = useState<Deal | null>(null);

  const allDeals = useMemo(() => board.flatMap((c) => c.deals), [board]);

  function onDragStart(e: DragStartEvent) {
    const deal = allDeals.find((d) => d.id === e.active.id);
    if (deal) setDragging(deal);
  }

  async function onDragEnd(e: DragEndEvent) {
    setDragging(null);
    if (!e.over) return;

    const dealId = e.active.id as string;
    const targetStageId = e.over.id as string;
    const deal = allDeals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === targetStageId) return;

    try {
      await dispatch(moveDealStage({ id: dealId, data: { stageId: targetStageId } })).unwrap();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to move deal");
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:snap-x sm:snap-mandatory">
        {board.map((column) => (
          <KanbanColumn key={column.id} column={column} tenantSlug={tenantSlug} />
        ))}
      </div>
      <DragOverlay>{dragging && <DealCard deal={dragging} tenantSlug={tenantSlug} dragging />}</DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ column, tenantSlug }: { column: DealBoardColumn; tenantSlug: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const total = column.deals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 snap-start flex-col rounded-lg border bg-muted/30 transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary/40" : ""
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
        <span className="text-xs text-muted-foreground">{fmtMoney(total)}</span>
      </div>
      <div className="min-h-[120px] space-y-2 p-2">
        {column.deals.map((deal) => (
          <DraggableDeal key={deal.id} deal={deal} tenantSlug={tenantSlug} />
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

function DraggableDeal({ deal, tenantSlug }: { deal: Deal; tenantSlug: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? "opacity-30" : ""}>
      <DealCard deal={deal} tenantSlug={tenantSlug} />
    </div>
  );
}

function DealCard({deal,tenantSlug,dragging}: {deal: Deal;tenantSlug: string;dragging?: boolean;}) {
  const contactName = formatFullName(deal.contact?.first_name, deal.contact?.last_name);
  const companyName = deal.leads?.company_name;

  return (
    <Link
      to={`/${tenantSlug}/deals/${deal.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className={`block rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow ${dragging ? "cursor-grabbing shadow-lg ring-2 ring-primary/40" : "cursor-grab"
        }`}
    >
      <div className="mb-1.5 text-sm font-medium leading-snug">{deal.title}</div>

      {companyName && (
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {companyName}
        </div>
      )}
      {contactName && (
        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          {contactName}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{fmtMoney(deal.amount)}</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {fmtDate(deal.expected_close_date)}
        </span>
      </div>
    </Link>
  );
}

// ---------- Table ----------

function TableView({ deals, tenantSlug }: { deals: Deal[]; tenantSlug: string }) {
  return (
    <div className="overflow-hidden rounded-md border bg-card">
    <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Deal</th>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Contact</th>
            <th className="px-3 py-2 font-medium">Stage</th>
            <th className="px-3 py-2 font-medium">Amount</th>
            <th className="px-3 py-2 font-medium">Close date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-muted/40">
              <td className="px-3 py-2.5 font-medium">
                <Link to={`/${tenantSlug}/deals/${deal.id}`} className="hover:underline">
                  {deal.title}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{deal.leads?.company_name ?? "—"}</td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {formatFullName(deal.contact?.first_name, deal.contact?.last_name) || "—"}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: deal.pipeline?.is_won
                      ? "#22c55e1a"
                      : deal.pipeline?.is_lost
                        ? "#ef44441a"
                        : "#3b82f61a",
                    color: deal.pipeline?.is_won
                      ? "#22c55e"
                      : deal.pipeline?.is_lost
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  {deal.pipeline?.name ?? "—"}
                </span>
              </td>
              <td className="px-3 py-2.5">{fmtMoney(deal.amount)}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{fmtDate(deal.expected_close_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}