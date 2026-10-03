import React from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { Plus, FileText } from "lucide-react";

const TEMPLATES = [
  { name: "Welcome — New Lead", subject: "Thanks for reaching out!", used: 34 },
  { name: "Follow-up after call", subject: "Great speaking with you", used: 21 },
  { name: "Proposal sent", subject: "Your proposal from Clearview", used: 12 },
  { name: "Invoice reminder", subject: "Payment reminder", used: 8 },
];

export default function EmailTemplatesPanel() {
  return (
    <SettingsCard title="Email Templates" desc="Reusable templates for your team." actions={<Btn><Plus size={15} /> New template</Btn>}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <FileText className="text-indigo-500" size={18} />
              <Badge>{t.used} sends</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{t.name}</p>
            <p className="text-xs text-slate-400">Subject: {t.subject}</p>
            <div className="mt-3 flex gap-2">
              <Btn variant="outline" className="px-3 py-1.5 text-xs">Preview</Btn>
              <Btn variant="outline" className="px-3 py-1.5 text-xs">Edit</Btn>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
