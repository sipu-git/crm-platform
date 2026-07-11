import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import DealCard from "@/components/deals/DealCard";
import DealFormDialog from "@/components/deals/DealFormDialog";
import DealDetailDrawer from "@/components/deals/DealDetailDrawer";

const STAGES = ["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const stageColors = {
  Qualification: "border-t-blue-500",
  Proposal: "border-t-amber-500",
  Negotiation: "border-t-orange-500",
  "Closed Won": "border-t-emerald-500",
  "Closed Lost": "border-t-red-400",
};

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchDeals = async () => {
    try {
      const data = await base44.entities.Deal.list("-created_date", 200);
      setDeals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleDragEnd = async (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStage = destination.droppableId;
    setDeals(prev => prev.map(d => d.id === draggableId ? { ...d, stage: newStage } : d));
    await base44.entities.Deal.update(draggableId, { stage: newStage });
  };

  const openDetail = (deal) => {
    setSelectedDeal(deal);
    setDrawerOpen(true);
  };

  const handleEdit = (deal) => {
    setDrawerOpen(false);
    setEditDeal(deal);
    setFormOpen(true);
  };

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-72 flex-shrink-0 bg-white rounded-xl border h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deal Pipeline"
        description={`${deals.length} deals · $${totalValue.toLocaleString()} total value`}
        actions={
          <Button onClick={() => { setEditDeal(null); setFormOpen(true); }} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Deal
          </Button>
        }
      />

      {deals.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No deals yet"
          description="Create your first deal or convert a lead"
          action={
            <Button onClick={() => { setEditDeal(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1.5" /> Add Deal
            </Button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageDeals = dealsByStage[stage];
              const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
              return (
                <div key={stage} className="w-72 flex-shrink-0">
                  <div className={`bg-white rounded-xl border border-t-[3px] ${stageColors[stage]} overflow-hidden`}>
                    <div className="px-4 py-3 border-b bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">{stage}</h3>
                        <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 font-medium">
                          {stageDeals.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">${stageTotal.toLocaleString()}</p>
                    </div>
                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2 space-y-2 min-h-[200px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-indigo-50/50" : ""
                          }`}
                        >
                          {stageDeals.map((deal, idx) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={idx}>
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={snap.isDragging ? "opacity-80" : ""}
                                >
                                  <DealCard deal={deal} onClick={openDetail} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <DealFormDialog open={formOpen} onOpenChange={setFormOpen} deal={editDeal} onSaved={fetchDeals} />
      <DealDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} deal={selectedDeal} onEdit={handleEdit} onRefresh={fetchDeals} />
    </div>
  );
}