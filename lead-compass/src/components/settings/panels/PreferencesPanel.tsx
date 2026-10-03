import React from "react";
import { SettingsCard, Field, SettingsSelect, ToggleRow, SaveBar, Separator } from "@/components/settings/Common";

export default function PreferencesPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Account Preferences" desc="Personalize how the CRM behaves for you.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Language"><SettingsSelect options={["English (US)", "English (UK)", "Hindi", "Bengali"]} /></Field>
          <Field label="Timezone"><SettingsSelect options={["Asia/Kolkata (UTC+5:30)", "UTC", "America/New_York", "Europe/London"]} /></Field>
          <Field label="Date format"><SettingsSelect options={["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"]} /></Field>
          <Field label="Currency"><SettingsSelect options={["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"]} /></Field>
          <Field label="Default landing page"><SettingsSelect options={["Dashboard", "Leads", "Contacts", "Deals", "Calendar"]} /></Field>
          <Field label="Rows per page"><SettingsSelect options={["10", "25", "50", "100"]} /></Field>
        </div>
        <Separator className="my-4" />
        <div className="divide-y divide-border">
          <ToggleRow label="Compact table density" desc="Show more rows per screen." />
          <ToggleRow label="Keyboard shortcuts" desc="Enable power-user shortcuts." defaultOn />
          <ToggleRow label="Week starts on Monday" defaultOn />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
