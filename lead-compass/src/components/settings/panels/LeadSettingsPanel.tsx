import React from "react";
import { SettingsCard, ToggleRow, SaveBar, Button } from "@/components/settings/Common";
import { Plus, X } from "lucide-react";

export default function LeadSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Lead Sources" desc="Sources available when creating a lead." actions={<Button variant="outline" size="sm"><Plus size={15} /> Add source</Button>}>
        <div className="flex flex-wrap gap-2">
          {["Website", "Referral", "Cold Call", "LinkedIn", "Advertisement", "Walk-in", "WhatsApp"].map((s) => (
            <span key={s} className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
              {s} <X size={13} className="cursor-pointer text-muted-foreground hover:text-destructive" />
            </span>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Lead Stages">
        <div className="flex flex-wrap gap-2">
          {["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"].map((s, i) => (
            <span key={s} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{i + 1}. {s}</span>
          ))}
        </div>
        <div className="mt-4"><Button variant="outline" size="sm"><Plus size={15} /> Add stage</Button></div>
      </SettingsCard>
      <SettingsCard title="Lead Scoring & Assignment">
        <div className="divide-y divide-border">
          <ToggleRow label="Enable lead scoring" desc="Score leads by engagement and profile fit." />
          <ToggleRow label="Round-robin assignment" defaultOn />
          <ToggleRow label="Auto-convert qualified leads to deals" />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
