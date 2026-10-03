import React from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { Plug } from "lucide-react";

const INTEGRATIONS = [
  { name: "Google Workspace", desc: "Gmail, Calendar, Drive", connected: true },
  { name: "WhatsApp Business", desc: "Message leads on WhatsApp", connected: false },
  { name: "Razorpay", desc: "Collect invoice payments", connected: false },
  { name: "Zapier", desc: "Connect 5,000+ apps", connected: false },
  { name: "Slack", desc: "Deal alerts in your channels", connected: false },
  { name: "Tally", desc: "Sync invoices to accounting", connected: false },
];

export default function IntegrationsPanel() {
  return (
    <SettingsCard title="Integrations" desc="Connect Clearview with the tools you already use.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <div key={i.name} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Plug size={18} /></div>
              {i.connected && <Badge color="green">Connected</Badge>}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{i.name}</p>
            <p className="text-xs text-slate-400">{i.desc}</p>
            <div className="mt-3">
              <Btn variant={i.connected ? "outline" : "default"} className="px-3 py-1.5 text-xs">
                {i.connected ? "Configure" : "Connect"}
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
