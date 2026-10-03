import React from "react";
import { SettingsCard, Field, SettingsSelect, ToggleRow, SaveBar, Separator } from "@/components/settings/Common";

export default function CrmConfigPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="CRM Configuration" desc="Global behavior for records across the CRM.">
        <div className="divide-y divide-border">
          <ToggleRow label="Require company for new contacts" desc="Contacts must be linked to a company." />
          <ToggleRow label="Auto-create contact from new lead" defaultOn />
          <ToggleRow label="Duplicate detection" desc="Warn on matching email or phone." defaultOn />
          <ToggleRow label="Merge duplicates automatically" />
          <ToggleRow label="Track record history" desc="Keep a change log on every record." defaultOn />
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default record owner"><SettingsSelect options={["Record creator", "Round robin", "Specific user"]} /></Field>
          <Field label="Inactive record archive after"><SettingsSelect options={["Never", "6 months", "12 months", "24 months"]} /></Field>
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
