import React from "react";
import { SettingsCard, Btn, Field, SettingsSelect, ToggleRow } from "@/components/settings/Common";
import { Download } from "lucide-react";

export default function DataPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Data Management" desc="Retention, backup and cleanup rules.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Deleted records kept for"><SettingsSelect options={["30 days", "60 days", "90 days"]} /></Field>
          <Field label="Automatic backups"><SettingsSelect options={["Daily", "Weekly", "Off"]} /></Field>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          <ToggleRow label="Anonymize personal data on delete" desc="GDPR-style erasure." defaultOn />
          <ToggleRow label="Archive closed deals older than 2 years" />
        </div>
      </SettingsCard>
      <SettingsCard title="Backup">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Last backup: 03 Oct 2026, 02:00 IST</p>
            <p className="text-xs text-slate-400">Includes all records, files and settings.</p>
          </div>
          <Btn variant="outline"><Download size={15} /> Download backup</Btn>
        </div>
      </SettingsCard>
    </div>
  );
}
