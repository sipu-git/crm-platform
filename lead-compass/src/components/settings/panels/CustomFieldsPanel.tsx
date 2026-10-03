import React from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { Plus, Pencil, Trash2 } from "lucide-react";

const FIELDS = [
  { name: "GST Number", type: "Text", module: "Companies" },
  { name: "Budget Range", type: "Dropdown", module: "Leads" },
  { name: "Renewal Date", type: "Date", module: "Deals" },
];

export default function CustomFieldsPanel() {
  return (
    <SettingsCard title="Custom Fields" desc="Add your own fields to CRM modules." actions={<Btn><Plus size={15} /> New field</Btn>}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="pb-3 font-medium">Field name</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Module</th>
            <th className="pb-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {FIELDS.map((f) => (
            <tr key={f.name}>
              <td className="py-3 font-medium text-slate-700">{f.name}</td>
              <td className="py-3"><Badge color="indigo">{f.type}</Badge></td>
              <td className="py-3 text-slate-600">{f.module}</td>
              <td className="py-3 text-right">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
                <button className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsCard>
  );
}
