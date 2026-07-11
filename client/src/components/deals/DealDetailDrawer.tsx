import React from "react";
import { base44 } from "@/api/base44Client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, DollarSign } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import ActivityTimeline from "@/components/shared/ActivityTimeline";
import { format } from "date-fns";

export default function DealDetailDrawer({ open, onOpenChange, deal, onEdit, onRefresh }) {
  if (!deal) return null;

  const handleDelete = async () => {
    await base44.entities.Deal.delete(deal.id);
    onOpenChange(false);
    onRefresh?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">{deal.title}</SheetTitle>
          <p className="text-sm text-slate-500">{deal.company || deal.contact_name}</p>
        </SheetHeader>

        <div className="space-y-5">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(deal)} className="gap-1.5 text-xs">
              <Pencil className="w-3 h-3" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1.5 text-xs ml-auto">
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Stage</p>
              <StatusBadge status={deal.stage} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Value</p>
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-green-500" />{(deal.value || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Contact</p>
              <p className="text-sm text-slate-700 mt-0.5">{deal.contact_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Probability</p>
              <p className="text-sm text-slate-700 mt-0.5">{deal.probability || 0}%</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm text-slate-700 mt-0.5 truncate">{deal.contact_email || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Close Date</p>
              <p className="text-sm text-slate-700 mt-0.5">
                {deal.expected_close_date ? format(new Date(deal.expected_close_date), "MMM d, yyyy") : "—"}
              </p>
            </div>
          </div>

          {deal.notes && (
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1">Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{deal.notes}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <ActivityTimeline entityType="Deal" entityId={deal.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}