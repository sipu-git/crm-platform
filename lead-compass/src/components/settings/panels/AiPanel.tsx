import React from "react";
import { SaveBar, SettingsCard, ToggleRow } from "../Common";

export default function AiPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="AI Assistant" desc="AI-powered features across the CRM.">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="AI lead summary" desc="One-paragraph summary on every lead." defaultOn />
          <ToggleRow label="Email drafting" desc="Draft replies and follow-ups with AI." defaultOn />
          <ToggleRow label="Deal win prediction" desc="Predict close probability on deals." />
          <ToggleRow label="Auto data enrichment" desc="Fill company and contact details automatically." />
          <ToggleRow label="Chat assistant" desc="Ask questions about your CRM data." defaultOn />
        </div>
      </SettingsCard>
      <SettingsCard title="Usage">
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-600">AI credits used this month</p>
          <p className="font-semibold text-slate-800">1,240 / 5,000</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-card">
          <div className="h-2 w-1/4 rounded-full bg-indigo-600" />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
