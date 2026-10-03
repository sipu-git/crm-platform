import React from "react";
import { SettingsCard, StatusBadge, Button } from "@/components/settings/Common";
import { Plus, Pencil, Trash2 } from "lucide-react";

const TEAM = [
  { name: "Sipu Rana", email: "sipusagar07@gmail.com", role: "Admin", status: "Active" },
  { name: "Sagar Sipu", email: "sipusagar982@gmail.com", role: "Sales Manager", status: "Active" },
  { name: "Biswajeet", email: "biswajeet780@gmail.com", role: "Sales Executive", status: "Invited" },
];

export default function TeamPanel() {
  return (
    <SettingsCard
      title="Team Members"
      desc="Manage who has access to this workspace."
      actions={<Button size="sm"><Plus size={15} /> Invite member</Button>}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-3 font-medium">Member</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TEAM.map((m) => (
              <tr key={m.email} className="group">
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {m.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-muted-foreground">{m.role}</td>
                <td className="py-3.5">
                  <StatusBadge color={m.status === "Active" ? "success" : "warning"}>{m.status}</StatusBadge>
                </td>
                <td className="py-3.5 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil size={15} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 size={15} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}
