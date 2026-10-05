import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export default function InvoiceField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
