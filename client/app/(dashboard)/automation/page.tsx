import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Plus, Zap, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

const TRIGGER_FIELDS = {
  Lead: ["status", "source"],
  Deal: ["stage"],
  Invoice: ["status"],
};

const TRIGGER_VALUES = {
  status: ["New", "Contacted", "Qualified", "Unqualified", "Converted", "Draft", "Sent", "Paid", "Overdue"],
  source: ["Website", "Referral", "LinkedIn", "Cold Call", "Email Campaign", "Trade Show", "Other"],
  stage: ["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
};

export default function Automation() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", trigger_entity: "Lead", trigger_field: "status",
    trigger_value: "Qualified", action_type: "Create Deal",
  });

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    fetchRules();
  }, [user]);

  const fetchRules = async () => {
    try {
      const data = await base44.entities.AutomationRule.list("-created_date", 100);
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    await base44.entities.AutomationRule.create(form);
    setDialogOpen(false);
    setForm({ name: "", trigger_entity: "Lead", trigger_field: "status", trigger_value: "Qualified", action_type: "Create Deal" });
    fetchRules();
  };

  const handleToggle = async (rule) => {
    await base44.entities.AutomationRule.update(rule.id, { is_active: !rule.is_active });
    fetchRules();
  };

  const handleDelete = async (id) => {
    await base44.entities.AutomationRule.delete(id);
    fetchRules();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border animate-pulse" />)}
      </div>
    );
  }

  const currentValues = TRIGGER_VALUES[form.trigger_field] || [];

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader
        title="Automation Rules"
        description="Automate actions based on data changes"
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Rule
          </Button>
        }
      />

      {rules.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automation rules"
          description="Create rules to automate your workflow"
          action={
            <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1.5" /> New Rule
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rule.is_active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{rule.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  When <span className="font-medium">{rule.trigger_entity}</span> {rule.trigger_field} is <span className="font-medium">{rule.trigger_value}</span> → <span className="font-medium">{rule.action_type}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(rule)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  {rule.is_active ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(rule.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Rule Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Auto-create deal on qualification" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">When</Label>
                <Select value={form.trigger_entity} onValueChange={v => setForm(f => ({ ...f, trigger_entity: v, trigger_field: TRIGGER_FIELDS[v][0] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Lead", "Deal", "Invoice"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Field</Label>
                <Select value={form.trigger_field} onValueChange={v => setForm(f => ({ ...f, trigger_field: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(TRIGGER_FIELDS[form.trigger_entity] || []).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Equals</Label>
                <Select value={form.trigger_value} onValueChange={v => setForm(f => ({ ...f, trigger_value: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currentValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Then</Label>
              <Select value={form.action_type} onValueChange={v => setForm(f => ({ ...f, action_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Create Deal", "Send Email", "Create Activity", "Update Status", "Send Notification"].map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={!form.name} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}