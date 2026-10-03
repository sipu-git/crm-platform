import React from "react";
import { SettingsCard, Btn } from "@/components/settings/Common";
import { Upload, Download } from "lucide-react";

export default function ImportExportPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Import" desc="Bring data in from CSV or another CRM.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["Leads", "Contacts", "Companies", "Deals"].map((m) => (
            <button key={m} className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
              <Upload size={18} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">Import {m}</p>
              <p className="text-xs text-slate-400">CSV / XLSX</p>
            </button>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Export" desc="Download your data anytime.">
        <div className="flex flex-wrap gap-2">
          {["Leads", "Contacts", "Companies", "Deals", "Invoices", "Activities"].map((m) => (
            <Btn key={m} variant="outline"><Download size={14} /> {m}</Btn>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
