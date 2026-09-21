import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyInput } from "@/features/companies/company.types";

export function CompanyFormFields({ draft, onChange }: { draft: CompanyInput; onChange: (next: CompanyInput) => void }) {
  const website = draft.website ?? {};
  const setWebsite = (key: keyof typeof website, value: string) => onChange({ ...draft, website: { ...website, [key]: value } });
  return <div className="space-y-3">
    <Field label="Company name"><Input value={draft.name} placeholder="Acme Inc." onChange={(event) => onChange({ ...draft, name: event.target.value })} /></Field>
    <Field label="Industry"><Input value={draft.industry ?? ""} placeholder="Software, Finance, Retail..." onChange={(event) => onChange({ ...draft, industry: event.target.value })} /></Field>
    <Field label="Website"><Input type="url" value={website.url ?? ""} placeholder="https://example.com" onChange={(event) => setWebsite("url", event.target.value)} /></Field>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="LinkedIn"><Input type="url" value={website.linkedin ?? ""} placeholder="https://linkedin.com/company/..." onChange={(event) => setWebsite("linkedin", event.target.value)} /></Field>
      <Field label="X / Twitter"><Input type="url" value={website.twitter ?? ""} placeholder="https://x.com/..." onChange={(event) => setWebsite("twitter", event.target.value)} /></Field>
    </div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>; }
