import React from "react";
import { SettingsCard } from "@/components/settings/Common";
import { Search } from "lucide-react";

const AUDIT = [
  { user: "Sipu Rana", action: "Updated deal 'Acme Corp — ₹4.5L'", time: "Today, 10:42" },
  { user: "Sagar Sipu", action: "Created lead 'Rohan Mehta'", time: "Today, 09:15" },
  { user: "Sipu Rana", action: "Deleted contact 'Test User'", time: "Yesterday, 18:03" },
  { user: "Biswajeet", action: "Exported contacts (CSV)", time: "Yesterday, 12:40" },
  { user: "Sipu Rana", action: "Changed role of Sagar Sipu to Sales Manager", time: "01 Oct, 16:22" },
];

export default function AuditPanel() {
  return (
    <SettingsCard title="Audit Logs" desc="Every important action in this workspace." actions={
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search logs…" className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
      </div>
    }>
      <div className="divide-y divide-slate-100">
        {AUDIT.map((a, i) => (
          <div key={i} className="flex items-center justify-between py-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {a.user.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-slate-700">{a.action}</p>
                <p className="text-xs text-slate-400">by {a.user}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">{a.time}</p>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
