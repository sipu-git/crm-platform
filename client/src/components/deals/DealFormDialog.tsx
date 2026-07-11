import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  title: "", value: 0, stage: "Qualification", contact_name: "",
  contact_email: "", company: "", expected_close_date: "",
  probability: 20, notes: "",
};

export default function DealFormDialog({ open, onOpenChange, deal, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!deal;

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title || "",
        value: deal.value || 0,
        stage: deal.stage || "Qualification",
        contact_name: deal.contact_name || "",
        contact_email: deal.contact_email || "",
        company: deal.company || "",
        expected_close_date: deal.expected_close_date || "",
        probability: deal.probability || 20,
        notes: deal.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [deal, open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await base44.entities.Deal.update(deal.id, form);
    } else {
      await base44.entities.Deal.create(form);
    }
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Deal Title *</Label>
            <Input value={form.title} onChange={set("title")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contact Name *</Label>
            <Input value={form.contact_name} onChange={set("contact_name")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contact Email</Label>
            <Input type="email" value={form.contact_email} onChange={set("contact_email")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Company</Label>
            <Input value={form.company} onChange={set("company")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Stage</Label>
            <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Value ($)</Label>
            <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Probability (%)</Label>
            <Input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Expected Close Date</Label>
            <Input type="date" value={form.expected_close_date} onChange={set("expected_close_date")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={set("notes")} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.title || !form.contact_name || saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}