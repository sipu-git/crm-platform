// features/leads/components/LeadFormFields.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead } from "@/features/leads/lead.types";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

const SOURCE_OPTIONS: { value: Lead["source"]; label: string }[] = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERAL", label: "Referral" },
  { value: "EVENT", label: "Event" },
  { value: "SOCIAL_MEDIA", label: "Social media" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "OTHER", label: "Other" },
];
export function LeadIdentityFields({
  draft,
  onChange,
  disabled = false,
}: {
  draft: Partial<Lead>;
  onChange: (next: Partial<Lead>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Field label="Name">
        <Input
          value={draft.full_name || ""}
          placeholder="John Adams"
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, full_name: e.target.value })}
        />
      </Field>
      <Field label="Company">
        <Input
          value={draft.company_name || ""}
          placeholder="TCS, Google, Infosys"
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, company_name: e.target.value })}
        />
      </Field>
      <Field label="Designation">
        <Input
          value={draft.designation || ""}
          placeholder="Software Engineer"
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, designation: e.target.value })}
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={draft.email || ""}
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, email: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={draft.phone || ""}
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, phone: e.target.value })}
        />
      </Field>
      <Field label="Source">
        <Select
          value={draft.source}
          disabled={disabled}
          onValueChange={(v) => onChange({ ...draft, source: v as Lead["source"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}