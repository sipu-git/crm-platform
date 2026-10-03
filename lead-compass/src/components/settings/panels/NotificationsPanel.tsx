import React from "react";
import { SettingsCard, ToggleRow, SaveBar, Separator } from "@/components/settings/Common";

export default function NotificationsPanel() {
  const rows: [string, string][] = [
    ["New lead assigned", "Email + push when a lead is assigned to you"],
    ["Deal stage changed", "When a deal you own moves stage"],
    ["Task due reminder", "Reminder before a task is due"],
    ["Mentions", "When someone @mentions you"],
    ["Weekly digest", "Summary of your pipeline every Monday"],
    ["Product updates", "News about new CRM features"],
  ];
  return (
    <div className="space-y-6">
      <SettingsCard title="Notification Channels" desc="Choose how you want to be notified.">
        <div className="divide-y divide-border">
          <ToggleRow label="Email notifications" defaultOn />
          <ToggleRow label="In-app notifications" defaultOn />
          <ToggleRow label="Browser push notifications" />
          <ToggleRow label="WhatsApp notifications" desc="Requires WhatsApp integration." />
        </div>
      </SettingsCard>
      <SettingsCard title="Events" desc="Pick which events trigger a notification.">
        <div className="divide-y divide-border">
          {rows.map(([t, d]) => <ToggleRow key={t} label={t} desc={d} defaultOn={t !== "Product updates"} />)}
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
