import React from "react";
import { SettingsCard, Btn, Field,SettingsSelect, Badge, ToggleRow } from "@/components/settings/Common";
import { Calendar } from "lucide-react";

export default function CalendarPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Calendar Sync" desc="Sync meetings with your external calendar.">
        <div className="space-y-3">
          {([["Google Calendar", false], ["Microsoft Outlook", false]] as [string, boolean][]).map(([name, connected]) => (
            <div key={name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400" size={20} />
                <p className="text-sm font-medium text-slate-700">{name}</p>
              </div>
              {connected ? <Badge color="green">Connected</Badge> : <Btn variant="outline">Connect</Btn>}
            </div>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Scheduling">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default meeting duration"><SettingsSelect options={["15 min", "30 min", "45 min", "60 min"]} /></Field>
          <Field label="Buffer between meetings"><SettingsSelect options={["None", "5 min", "10 min", "15 min"]} /></Field>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          <ToggleRow label="Two-way sync" desc="Changes in either calendar update the other." defaultOn />
          <ToggleRow label="Public booking link" desc="Let contacts book time with you." />
        </div>
      </SettingsCard>
    </div>
  );
}
