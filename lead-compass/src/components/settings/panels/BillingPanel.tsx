import React from "react";
import { SettingsCard, Btn, Badge } from "@/components/settings/Common";
import { CreditCard, Download } from "lucide-react";

export default function BillingPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Current Plan">
        <div className="flex items-center justify-between rounded-lg bg-card px-5 py-4">
          <div>
            <p className="text-lg font-bold text-indigo-900">Growth Plan</p>
            <p className="text-sm text-indigo-600">₹1,499 / user / month · Renews 01 Nov 2026</p>
          </div>
          <Btn>Upgrade plan</Btn>
        </div>
      </SettingsCard>
      <SettingsCard title="Payment Method">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="text-slate-400" size={22} />
            <div>
              <p className="text-sm font-medium text-slate-700">Visa ending in 4242</p>
              <p className="text-xs text-slate-400">Expires 08/28</p>
            </div>
          </div>
          <Btn variant="outline">Update</Btn>
        </div>
      </SettingsCard>
      <SettingsCard title="Invoices">
        <div className="divide-y divide-slate-100 text-sm">
          {([["Sep 2026", "₹4,497", "Paid"], ["Aug 2026", "₹4,497", "Paid"], ["Jul 2026", "₹2,998", "Paid"]] as [string, string, string][]).map(([m, amt, st]) => (
            <div key={m} className="flex items-center justify-between py-3">
              <p className="text-slate-700">Subscription — {m}</p>
              <div className="flex items-center gap-4">
                <p className="font-medium text-slate-800">{amt}</p>
                <Badge color="green">{st}</Badge>
                <button className="text-slate-400 hover:text-indigo-600"><Download size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
