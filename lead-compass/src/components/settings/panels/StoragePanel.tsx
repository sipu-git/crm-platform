import React from "react";
import { SettingsCard, Btn } from "@/components/settings/Common";

export default function StoragePanel() {
  return (
    <SettingsCard title="Storage" desc="Files attached to records, emails and invoices.">
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-600">Used</p>
        <p className="font-semibold text-slate-800">3.2 GB / 25 GB</p>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-slate-100">
        <div className="h-2.5 w-[13%] rounded-full bg-indigo-600" />
      </div>
      <div className="mt-6 space-y-2 text-sm">
        {([["Record attachments", "1.8 GB"], ["Email attachments", "0.9 GB"], ["Invoice PDFs", "0.3 GB"], ["Other", "0.2 GB"]] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-slate-600">{k}</p><p className="font-medium text-slate-800">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5"><Btn variant="outline">Manage files</Btn></div>
    </SettingsCard>
  );
}
