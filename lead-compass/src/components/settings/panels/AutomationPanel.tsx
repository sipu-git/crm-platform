import React from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { Plus, Workflow } from "lucide-react";

const WORKFLOWS = [
  { name: "Welcome email on new lead", trigger: "Lead created", active: true },
  { name: "Assign round-robin", trigger: "Lead created", active: true },
  { name: "Follow-up task after meeting", trigger: "Activity logged", active: false },
  { name: "Notify manager on deal > ₹5L", trigger: "Deal updated", active: true },
];

export default function AutomationPanel() {
  return (
    <SettingsCard title="Workflow Automation" desc="Automate repetitive work with triggers and actions." actions={<Btn><Plus size={15} /> New workflow</Btn>}>
      <div className="space-y-3">
        {WORKFLOWS.map((w) => (
          <div key={w.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Workflow size={17} /></div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                <p className="text-xs text-slate-400">Trigger: {w.trigger}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge color={w.active ? "green" : "slate"}>{w.active ? "Active" : "Paused"}</Badge>
              <Btn variant="outline" className="px-3 py-1.5 text-xs">Edit</Btn>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
