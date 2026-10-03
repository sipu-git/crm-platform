import React from "react";
import { SettingsCard, Btn } from "@/components/settings/Common";
import { Trash2 } from "lucide-react";

export default function DangerPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Danger Zone" desc="Irreversible actions — proceed with care.">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 dark:bg-card px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Transfer ownership</p>
              <p className="text-xs text-slate-400">Make another admin the workspace owner.</p>
            </div>
            <Btn variant="outline">Transfer</Btn>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Delete all CRM data</p>
              <p className="text-xs text-slate-400">Removes every lead, contact, deal and invoice. Settings are kept.</p>
            </div>
            <Btn variant="outline">Delete data</Btn>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-700">Delete workspace</p>
              <p className="text-xs text-red-400">Permanently deletes this workspace and everything in it.</p>
            </div>
            <Btn variant="default"><Trash2 size={15} /> Delete workspace</Btn>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
