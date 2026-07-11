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
  first_name: "", last_name: "", email: "", phone: "",
  company: "", job_title: "", source: "Website", status: "New",
  estimated_value: 0, notes: "",
};

export default function LeadFormDialog({ open, onOpenChange, lead, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!lead;

  useEffect(() => {
    if (lead) {
      setForm({
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        job_title: lead.job_title || "",
        source: lead.source || "Website",
        status: lead.status || "New",
        estimated_value: lead.estimated_value || 0,
        notes: lead.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [lead, open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await base44.entities.Lead.update(lead.id, form);
    } else {
      await base44.entities.Lead.create(form);
    }
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">First Name *</Label>
            <Input value={form.first_name} onChange={set("first_name")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Last Name *</Label>
            <Input value={form.last_name} onChange={set("last_name")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Company</Label>
            <Input value={form.company} onChange={set("company")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Job Title</Label>
            <Input value={form.job_title} onChange={set("job_title")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Source</Label>
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Website", "Referral", "LinkedIn", "Cold Call", "Email Campaign", "Trade Show", "Other"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["New", "Contacted", "Qualified", "Unqualified", "Converted"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Estimated Value ($)</Label>
            <Input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: Number(e.target.value) }))} />
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
            disabled={!form.first_name || !form.last_name || !form.email || saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}