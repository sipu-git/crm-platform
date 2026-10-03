import React from "react";
import { SettingsCard, SaveBar, Btn } from "@/components/settings/Common";
import { Plus } from "lucide-react";

export default function ApiPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="API Keys" desc="Programmatic access to your workspace." actions={<Btn><Plus size={15} /> Generate key</Btn>}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-700">Production key</p>
              <p className="font-mono text-xs text-slate-400">cv_live_••••••••••••3f9a</p>
            </div>
            <div className="flex gap-2">
              <Btn variant="outline" className="px-3 py-1.5 text-xs">Reveal</Btn>
              <Btn variant="outline" className="px-3 py-1.5 text-xs">Revoke</Btn>
            </div>
          </div>
        </div>
      </SettingsCard>
      <SettingsCard title="Webhooks" desc="Send events to your own endpoints." actions={<Btn variant="outline"><Plus size={15} /> Add endpoint</Btn>}>
        <p className="text-sm text-slate-400">No webhook endpoints configured yet.</p>
      </SettingsCard>
      <SettingsCard title="Developer Resources">
        <div className="flex flex-wrap gap-2">
          <Btn variant="outline">API documentation</Btn>
          <Btn variant="outline">Rate limits (120 req/min)</Btn>
          <Btn variant="outline">Changelog</Btn>
        </div>
      </SettingsCard>
    </div>
  );
}
