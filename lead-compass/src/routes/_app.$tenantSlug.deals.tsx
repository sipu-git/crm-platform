import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createDeal,
  dealsSelectors,
  fetchDeals,
  moveDealOptimistic,
  revertStage,
  setView,
  updateDeal,
} from "@/features/deals/slice";
import { PageHeader, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kanban as KanbanIcon, Rows3, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { DEAL_STAGES, type Deal, type DealStage } from "@/lib/mockDb";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/$tenantSlug/deals")({
  ssr: false,
  component: DealsPage,
});

const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function DealsPage() {
  const { tenantSlug } = Route.useParams();
  const dispatch = useAppDispatch();
  const deals = useAppSelector(dealsSelectors.selectAll);
  const view = useAppSelector((s) => s.deals.view);
  const status = useAppSelector((s) => s.deals.status);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDeals(tenantSlug));
  }, [dispatch, tenantSlug]);

  return (
    <div>
      <PageHeader
        title="Deals"
        description="Track pipeline value across every stage."
        actions={
          <div className="flex gap-2">
            <div className="flex rounded-md border p-0.5">
              <Button
                size="sm"
                variant={view === "kanban" ? "secondary" : "ghost"}
                onClick={() => dispatch(setView("kanban"))}
              >
                <KanbanIcon className="mr-2 h-4 w-4" /> Kanban
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "secondary" : "ghost"}
                onClick={() => dispatch(setView("table"))}
              >
                <Rows3 className="mr-2 h-4 w-4" /> Table
              </Button>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New deal
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {status === "loading" && deals.length === 0 && <TableSkeleton rows={4} cols={6} />}
        {view === "kanban" ? (
          <KanbanView tenantSlug={tenantSlug} deals={deals} />
        ) : (
          <TableView deals={deals} tenantSlug={tenantSlug} />
        )}
      </div>

      <CreateDealDialog tenantSlug={tenantSlug} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function KanbanView({ tenantSlug, deals }: { tenantSlug: string; deals: Deal[] }) {
  const dispatch = useAppDispatch();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [dragging, setDragging] = useState<Deal | null>(null);

  const byStage = DEAL_STAGES.reduce<Record<DealStage, Deal[]>>(
    (acc, s) => {
      acc[s] = deals.filter((d) => d.stage === s);
      return acc;
    },
    {} as Record<DealStage, Deal[]>,
  );

  function onDragStart(e: DragStartEvent) {
    const d = deals.find((x) => x.id === e.active.id);
    if (d) setDragging(d);
  }

  async function onDragEnd(e: DragEndEvent) {
    setDragging(null);
    if (!e.over) return;
    const id = e.active.id as string;
    const newStage = e.over.id as DealStage;
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === newStage) return;
    const previous = deal.stage;
    dispatch(moveDealOptimistic({ id, stage: newStage }));
    try {
      await dispatch(updateDeal({ tenantSlug, id, changes: { stage: newStage } })).unwrap();
    } catch {
      dispatch(revertStage({ id, stage: previous }));
      toast.error("Failed to move deal — reverted");
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {DEAL_STAGES.map((stage) => (
          <KanbanColumn key={stage} stage={stage} deals={byStage[stage]} />
        ))}
      </div>
      <DragOverlay>
        {dragging && <DealCard deal={dragging} dragging />}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((s, d) => s + d.amount, 0);
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
        isOver ? "bg-primary/5 ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{STAGE_LABELS[stage]}</span>
          <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{fmtMoney(total)}</span>
      </div>
      <div className="min-h-[100px] space-y-2 p-2">
        {deals.map((d) => (
          <DraggableDeal key={d.id} deal={d} />
        ))}
        {deals.length === 0 && (
          <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableDeal({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-30" : ""}
    >
      <DealCard deal={deal} />
    </div>
  );
}

function DealCard({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  const { tenantSlug } = Route.useParams();
  return (
    <Link
      to={`/${tenantSlug}/deals/${deal.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className={`block rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow ${
        dragging ? "cursor-grabbing shadow-lg ring-2 ring-primary/40" : "cursor-grab"
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-medium">{deal.title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{deal.company}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{fmtMoney(deal.amount)}</span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(deal.closeDate).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

function TableView({ deals, tenantSlug }: { deals: Deal[]; tenantSlug: string }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Deal</th>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Stage</th>
            <th className="px-3 py-2 font-medium">Amount</th>
            <th className="px-3 py-2 font-medium">Close date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {deals.map((d) => (
            <tr key={d.id} className="hover:bg-muted/40">
              <td className="px-3 py-2 font-medium">
                <Link
                  to={`/${tenantSlug}/deals/${d.id}`}
                  className="hover:underline"
                >
                  {d.title}
                </Link>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{d.company}</td>
              <td className="px-3 py-2 capitalize">{d.stage}</td>
              <td className="px-3 py-2">{fmtMoney(d.amount)}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {new Date(d.closeDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateDealDialog({
  tenantSlug,
  open,
  onOpenChange,
}: {
  tenantSlug: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<Partial<Deal>>({
    title: "",
    company: "",
    amount: 0,
    stage: "lead",
    closeDate: new Date().toISOString(),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New deal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input value={draft.company || ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input
                type="number"
                value={draft.amount || 0}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select
                value={draft.stage || "lead"}
                onValueChange={(v) => setDraft({ ...draft, stage: v as DealStage })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              await dispatch(createDeal({ tenantSlug, input: draft }));
              toast.success("Deal created");
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
