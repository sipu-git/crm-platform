import React from "react";
import { SettingsCard, Field, SettingsInput, StatusBadge, Button } from "@/components/settings/Common";
import { KeyRound, Smartphone } from "lucide-react";

export default function SecurityPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Password" desc="Change your account password.">
        <div className="grid max-w-md gap-4">
          <Field label="Current password"><SettingsInput type="password" /></Field>
          <Field label="New password"><SettingsInput type="password" /></Field>
          <Field label="Confirm new password"><SettingsInput type="password" /></Field>
          <div><Button><KeyRound size={15} /> Update password</Button></div>
        </div>
      </SettingsCard>
      <SettingsCard title="Two-factor authentication" desc="Add an extra layer of security.">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="text-muted-foreground" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground">Authenticator app</p>
              <p className="text-xs text-muted-foreground">Use Google Authenticator or similar.</p>
            </div>
          </div>
          <StatusBadge color="warning">Not enabled</StatusBadge>
        </div>
        <div className="mt-4"><Button variant="outline">Enable 2FA</Button></div>
      </SettingsCard>
      <SettingsCard title="Active sessions" desc="Devices currently signed in.">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Chrome · Windows <StatusBadge color="success">This device</StatusBadge></p>
              <p className="text-xs text-muted-foreground">Kolkata, India · Last active now</p>
            </div>
          </div>
        </div>
        <div className="mt-4"><Button variant="destructive" size="sm">Sign out all other sessions</Button></div>
      </SettingsCard>
    </div>
  );
}
