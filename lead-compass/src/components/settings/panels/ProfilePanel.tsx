import React from "react";
import { SettingsCard, Field, SettingsInput, SettingsSelect, SaveBar, Button } from "@/components/settings/Common";
import { Upload } from "lucide-react";

export default function ProfilePanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Profile" desc="This information appears across the workspace.">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            SR
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Upload size={15} /> Upload photo</Button>
            <Button variant="outline" size="sm">Remove</Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name"><SettingsInput defaultValue="Sipu" /></Field>
          <Field label="Last name"><SettingsInput defaultValue="Rana" /></Field>
          <Field label="Email"><SettingsInput defaultValue="sipusagar07@gmail.com" type="email" /></Field>
          <Field label="Phone"><SettingsInput defaultValue="+91 98275 05917" /></Field>
          <Field label="Job title"><SettingsInput defaultValue="Administrator" /></Field>
          <Field label="Department"><SettingsSelect options={["Sales", "Marketing", "Support", "Management"]} /></Field>
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
