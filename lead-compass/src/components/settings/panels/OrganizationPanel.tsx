import React from "react";
import { SettingsCard, Field, SettingsInput, SettingsSelect, SaveBar } from "@/components/settings/Common";

export default function OrganizationPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Organization" desc="Workspace identity and business details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Organization name"><SettingsInput defaultValue="Clearview CRM" /></Field>
          <Field label="Workspace ID"><SettingsInput defaultValue="632ab98c-b482-4377-bd38-0c8…" disabled /></Field>
          <Field label="Industry"><SettingsSelect options={["Technology", "Real Estate", "Finance", "Healthcare", "Education", "Other"]} /></Field>
          <Field label="Company size"><SettingsSelect options={["1–10", "11–50", "51–200", "201–1000", "1000+"]} /></Field>
          <Field label="Website"><SettingsInput placeholder="https://example.com" /></Field>
          <Field label="GSTIN"><SettingsInput placeholder="22AAAAA0000A1Z5" /></Field>
        </div>
        <div className="mt-4">
          <Field label="Address"><SettingsInput placeholder="Street, City, State, PIN" /></Field>
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
