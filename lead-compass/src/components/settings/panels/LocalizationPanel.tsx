import React from "react";
import { SettingsCard, Field, SettingsSelect, SaveBar } from "@/components/settings/Common";

export default function LocalizationPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Localization" desc="Workspace-wide regional defaults (users can override their own).">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default language"><SettingsSelect options={["English", "Hindi", "Bengali", "Tamil", "Telugu"]} /></Field>
          <Field label="Default timezone"><SettingsSelect options={["Asia/Kolkata (UTC+5:30)", "UTC", "America/New_York"]} /></Field>
          <Field label="Default currency"><SettingsSelect options={["INR (₹)", "USD ($)", "EUR (€)"]} /></Field>
          <Field label="Number format"><SettingsSelect options={["1,00,000 (Indian)", "100,000 (International)"]} /></Field>
          <Field label="Fiscal year start"><SettingsSelect options={["April", "January"]} /></Field>
          <Field label="Tax label"><SettingsSelect options={["GST", "VAT", "Sales Tax", "None"]} /></Field>
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
