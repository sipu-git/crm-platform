import React from "react";
import { SettingsCard } from "@/components/settings/Common";

export default function HelpPanel() {
  return (
    <SettingsCard title="Help & Support">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {([
          ["📚 Knowledge base", "Guides and how-tos for every module."],
          ["💬 Chat with support", "Avg. response under 10 minutes."],
          ["🎥 Video tutorials", "Short walkthroughs of key features."],
          ["🐛 Report a bug", "Tell us what broke and where."],
        ] as [string, string][]).map(([t, d]) => (
          <button key={t} className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/40">
            <p className="text-sm font-semibold text-slate-800">{t}</p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Clearview CRM v2.4.1 · Need urgent help? Email <span className="font-medium text-indigo-600">support@clearviewcrm.com</span>
      </div>
    </SettingsCard>
  );
}
