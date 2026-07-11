import React from "react";
import { base44 } from "@/api/base44Client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import ActivityTimeline from "@/components/shared/ActivityTimeline";
import { useNavigate } from "react-router-dom";

export default function LeadDetailDrawer({ open, onOpenChange, lead, onEdit, onRefresh }) {
  const navigate = useNavigate();

  if (!lead) return null;

  const handleDelete = async () => {
    await base44.entities.Lead.delete(lead.id);
    onOpenChange(false);
    onRefresh?.();
  };

  const handleConvert = async () => {
    await base44.entities.Deal.create({
      title: `${lead.company || lead.first_name + " " + lead.last_name} Deal`,
      contact_name: `${lead.first_name} ${lead.last_name}`,
      contact_email: lead.email,
      company: lead.company || "",
      value: lead.estimated_value || 0,
      lead_id: lead.id,
      stage: "Qualification",
    });
    await base44.entities.Lead.update(lead.id, { status: "Converted" });
    await base44.entities.Activity.create({
      type: "Deal Created",
      title: "Lead converted to deal",
      entity_type: "Lead",
      entity_id: lead.id,
    });
    onOpenChange(false);
    onRefresh?.();
    navigate("/deals");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </div>
            <div>
              <SheetTitle className="text-lg">{lead.first_name} {lead.last_name}</SheetTitle>
              <p className="text-sm text-slate-500">{lead.job_title}{lead.company ? ` at ${lead.company}` : ""}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(lead)} className="gap-1.5 text-xs">
              <Pencil className="w-3 h-3" /> Edit
            </Button>
            {lead.status !== "Converted" && (
              <Button size="sm" onClick={handleConvert} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700">
                <ArrowRightLeft className="w-3 h-3" /> Convert to Deal
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1.5 text-xs ml-auto">
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Status</p>
              <StatusBadge status={lead.status} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Source</p>
              <p className="text-sm text-slate-700 mt-0.5">{lead.source || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm text-slate-700 mt-0.5 truncate">{lead.email}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Phone</p>
              <p className="text-sm text-slate-700 mt-0.5">{lead.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Est. Value</p>
              <p className="text-sm text-slate-700 mt-0.5">${(lead.estimated_value || 0).toLocaleString()}</p>
            </div>
          </div>

          {lead.notes && (
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1">Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{lead.notes}</p>
            </div>
          )}

          {/* Activity timeline */}
          <div className="border-t pt-4">
            <ActivityTimeline entityType="Lead" entityId={lead.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}