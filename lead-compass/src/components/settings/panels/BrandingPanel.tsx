import React from "react";
import { SettingsCard, Field, SettingsInput, SettingsSelect, ToggleRow, SaveBar, Button, Separator } from "@/components/settings/Common";
import { Upload } from "lucide-react";

export default function BrandingPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Branding" desc="Logo and colors used in the app, emails and invoices.">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">C</div>
          <Button variant="outline" size="sm"><Upload size={15} /> Upload logo</Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Primary color"><SettingsInput type="color" defaultValue="#4f46e5" className="h-10 p-1" /></Field>
          <Field label="Accent color"><SettingsInput type="color" defaultValue="#0ea5e9" className="h-10 p-1" /></Field>
          <Field label="Sidebar theme"><SettingsSelect options={["Dark", "Light"]} /></Field>
        </div>
        <Separator className="my-4" />
        <div className="divide-y divide-border">
          <ToggleRow label="Show logo on invoices" defaultOn />
          <ToggleRow label="Show logo in email footer" defaultOn />
          <ToggleRow label="White-label (hide Clearview branding)" desc="Available on Enterprise plan." />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
