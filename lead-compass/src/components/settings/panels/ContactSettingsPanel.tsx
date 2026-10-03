import React from "react";
import { SettingsCard, Field, SettingsSelect, ToggleRow, SaveBar, Separator } from "@/components/settings/Common";

export default function ContactSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Contact Settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default designation list"><SettingsSelect options={["Custom per contact", "Shared list"]} /></Field>
          <Field label="Phone format"><SettingsSelect options={["+91 XXXXX XXXXX", "Free format"]} /></Field>
        </div>
        <Separator className="my-4" />
        <div className="divide-y divide-border">
          <ToggleRow label="Allow contacts without a company" defaultOn />
          <ToggleRow label="Sync contact avatar from email provider" />
          <ToggleRow label="Birthday reminders" defaultOn />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
