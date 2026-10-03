import React from "react";
import { SettingsCard, Btn, ToggleRow } from "@/components/settings/Common";
import { MessageCircle } from "lucide-react";

export default function WhatsappPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="WhatsApp Business" desc="Connect WhatsApp Business API to message leads and contacts.">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-emerald-500" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">WhatsApp Business API</p>
              <p className="text-xs text-slate-400">Not connected</p>
            </div>
          </div>
          <Btn>Connect</Btn>
        </div>
      </SettingsCard>
      <SettingsCard title="Messaging Preferences">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Auto-reply outside working hours" />
          <ToggleRow label="Log WhatsApp chats as activities" defaultOn />
          <ToggleRow label="Require approved templates for first message" defaultOn />
        </div>
      </SettingsCard>
    </div>
  );
}
