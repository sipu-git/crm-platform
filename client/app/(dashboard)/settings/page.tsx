import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({ full_name: u?.full_name || "" });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: form.full_name });
    setSaving(false);
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" />

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-800">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <Input value={user?.role || ""} disabled className="bg-slate-50 capitalize" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}