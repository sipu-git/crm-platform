import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  ArrowRightLeft,
  Handshake,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeIcons = {
  Note: MessageSquare,
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Task: CheckSquare,
  "Status Change": ArrowRightLeft,
  "Deal Created": Handshake,
  "Invoice Sent": FileText,
};

const typeColors = {
  Note: "bg-slate-100 text-slate-600",
  Call: "bg-green-100 text-green-600",
  Email: "bg-blue-100 text-blue-600",
  Meeting: "bg-purple-100 text-purple-600",
  Task: "bg-amber-100 text-amber-600",
  "Status Change": "bg-orange-100 text-orange-600",
  "Deal Created": "bg-indigo-100 text-indigo-600",
  "Invoice Sent": "bg-teal-100 text-teal-600",
};

export default function ActivityTimeline({ entityType, entityId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "Note", title: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      const data = await base44.entities.Activity.filter(
        { entity_type: entityType, entity_id: entityId },
        "-created_date",
        50
      );
      setActivities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [entityType, entityId]);

  const handleAdd = async () => {
    setSaving(true);
    await base44.entities.Activity.create({
      ...form,
      entity_type: entityType,
      entity_id: entityId,
    });
    setForm({ type: "Note", title: "", description: "" });
    setDialogOpen(false);
    setSaving(false);
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Activity</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Note", "Call", "Email", "Meeting", "Task"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
              <Button onClick={handleAdd} disabled={!form.title || saving} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {saving ? "Saving…" : "Add Activity"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-4">
            {activities.map((a) => {
              const Icon = typeIcons[a.type] || MessageSquare;
              const color = typeColors[a.type] || "bg-slate-100 text-slate-600";
              return (
                <div key={a.id} className="flex gap-3 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{a.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDistanceToNow(new Date(a.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}