import React from "react";
import { SettingsCard, Field, SettingsInput, SettingsSelect, StatusBadge, ToggleRow, SaveBar, Button, Separator } from "@/components/settings/Common";
import { Plus } from "lucide-react";

export default function DealSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Pipelines" desc="Sales pipelines and their stages." actions={<Button size="sm"><Plus size={15} /> New pipeline</Button>}>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Sales Pipeline <StatusBadge color="default">Default</StatusBadge></p>
            <Button variant="outline" size="sm">Edit stages</Button>
          </div>
          <div className="mt-3 flex gap-1.5">
            {["Qualification", "Meeting", "Proposal", "Negotiation", "Won"].map((s, i) => (
              <div key={s} className="flex-1 rounded-md bg-primary/10 px-2 py-1.5 text-center text-xs font-medium text-primary" style={{ opacity: 1 - i * 0.12 }}>{s}</div>
            ))}
          </div>
        </div>
      </SettingsCard>
      <SettingsCard title="Deal Behavior">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default currency"><SettingsSelect options={["INR (₹)", "USD ($)", "EUR (€)"]} /></Field>
          <Field label="Rotting period (days)"><SettingsInput type="number" defaultValue="14" /></Field>
        </div>
        <Separator className="my-4" />
        <div className="divide-y divide-border">
          <ToggleRow label="Require expected close date" defaultOn />
          <ToggleRow label="Require lost reason" defaultOn />
          <ToggleRow label="Auto-create invoice on won deal" />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
