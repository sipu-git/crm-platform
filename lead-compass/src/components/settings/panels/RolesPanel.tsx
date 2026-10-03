import React from "react";
import { SettingsCard, StatusBadge, Button } from "@/components/settings/Common";
import { Plus } from "lucide-react";

const ROLES = [
  { role: "Admin", members: 1, desc: "Full access to all modules and settings." },
  { role: "Sales Manager", members: 1, desc: "Manage pipeline, team and reports." },
  { role: "Sales Executive", members: 1, desc: "Own leads, contacts and deals only." },
  { role: "Read Only", members: 0, desc: "View data, no edits." },
];

const PERMISSIONS = ["Leads", "Contacts", "Companies", "Deals", "Invoices", "Reports", "Settings"];

export default function RolesPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Roles" desc="Define what each role can see and do." actions={<Button size="sm"><Plus size={15} /> New role</Button>}>
        <div className="space-y-3">
          {ROLES.map((r) => (
            <div key={r.role} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.role}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge color="default">{r.members} member{r.members !== 1 ? "s" : ""}</StatusBadge>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Permission matrix" desc="Example matrix for the Sales Executive role.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-medium">Module</th>
                <th className="pb-3 font-medium">View</th>
                <th className="pb-3 font-medium">Create</th>
                <th className="pb-3 font-medium">Edit</th>
                <th className="pb-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSIONS.map((p) => (
                <tr key={p}>
                  <td className="py-2.5 font-medium text-foreground">{p}</td>
                  {["view", "create", "edit", "delete"].map((a) => (
                    <td key={a} className="py-2.5">
                      <input type="checkbox" defaultChecked={a !== "delete" && p !== "Settings"} className="h-4 w-4 rounded border-border accent-primary" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}
