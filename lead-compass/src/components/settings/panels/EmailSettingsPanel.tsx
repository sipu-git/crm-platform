import React from "react";
import { SettingsCard, Btn, Field, Badge, ToggleRow, SaveBar } from "@/components/settings/Common";
import { Mail, Plus } from "lucide-react";

export default function EmailSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Mailbox Connection" desc="Connect your mailbox to send and track emails.">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Mail className="text-slate-400" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">sipusagar07@gmail.com</p>
              <p className="text-xs text-slate-400">Gmail · Connected</p>
            </div>
          </div>
          <Badge color="green">Connected</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <Btn variant="outline">Reconnect</Btn>
          <Btn variant="outline"><Plus size={15} /> Add another mailbox</Btn>
        </div>
      </SettingsCard>
      <SettingsCard title="Sending & Tracking">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Track email opens" defaultOn />
          <ToggleRow label="Track link clicks" defaultOn />
          <ToggleRow label="BCC all outgoing mail to CRM" />
          <ToggleRow label="Include unsubscribe link" defaultOn />
        </div>
        <div className="mt-5 max-w-md">
          <Field label="Email signature">
            <textarea rows={4} defaultValue={"Regards,\nSipu Rana\nClearview CRM"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </Field>
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
