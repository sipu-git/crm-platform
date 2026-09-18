import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2, Globe, Mail, Phone, MapPin, Tag, ArrowLeft,
  FileCheck2, CreditCard, Copy, Users, ExternalLink,
} from "lucide-react";
import { useCompanyById } from "@/features/companies/hooks/useCompanies";
import { companyStepMeta } from "@/features/companies/company-wizard.schma";
import { formatCurrency, formatINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Company } from "@/features/companies/types/companies.types";

const statusVariant: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-muted text-muted-foreground border-border",
  PROSPECT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const sizeVariant: Record<string, string> = {
  SMALL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  MEDIUM: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  LARGE: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  ENTERPRISE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

interface FieldConfig {
  key: keyof Company;
  label: string;
  span?: boolean;
  copyable?: boolean;
  render?: (c: Company) => React.ReactNode;
}

interface SectionConfig {
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
}

// Read-only data map — one entry per field, driving both the label and the
// display renderer. No edit affordance exists on this page at all.
const SECTIONS: SectionConfig[] = [
  {
    icon: Building2,
    fields: [
      { key: "name", label: "Company Name" },
      { key: "legal_name", label: "Legal Name" },
      { key: "industry", label: "Industry" },
      { key: "size", label: "Company Size" },
      {
        key: "annual_revenue", label: "Annual Revenue", span: true,
        render: (c) => c.annual_revenue != null ? <span className="font-mono">{formatCurrency(c.annual_revenue)}</span> : undefined,
      },
    ],
  },
  {
    icon: Globe,
    fields: [
      {
        key: "website", label: "Website", span: true,
        render: (c) => c.website ? (
          <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Globe className="h-3.5 w-3.5" /> {c.website.replace(/^https?:\/\//, "")}
          </a>
        ) : undefined
      },
      {
        key: "email", label: "Primary Email",
        render: (c) => c.email ? (
          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:underline">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {c.email}
          </a>
        ) : undefined
      },
      {
        key: "phone", label: "Phone Number",
        render: (c) => c.phone ? (
          <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 font-mono hover:underline">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {c.phone}
          </a>
        ) : undefined
      },
    ],
  },
  {
    icon: MapPin,
    fields: [
      { key: "address_line1", label: "Address Line 1" },
      { key: "address_line2", label: "Address Line 2" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "postal_code", label: "Postal Code" },
    ],
  },
  {
    icon: FileCheck2,
    fields: [
      {
        key: "gst_number", label: "GSTIN / GST Number", copyable: true,
        render: (c) => c.gst_number ? <span className="font-mono font-semibold tracking-wide">{c.gst_number}</span> : undefined
      },
      {
        key: "pan_number", label: "PAN Number", copyable: true,
        render: (c) => c.pan_number ? <span className="font-mono font-semibold tracking-wide">{c.pan_number}</span> : undefined
      },
      { key: "place_of_supply", label: "Place of Supply", span: true },
    ],
  },
  {
    icon: CreditCard,
    fields: [
      {
        key: "billing_email", label: "Billing Email",
        render: (c) => c.billing_email ? (
          <a href={`mailto:${c.billing_email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
            <Mail className="h-3.5 w-3.5" /> {c.billing_email}
          </a>
        ) : undefined
      },
      {
        key: "billing_phone", label: "Billing Phone",
        render: (c) => c.billing_phone ? (
          <a href={`tel:${c.billing_phone}`} className="inline-flex items-center gap-1 font-mono hover:underline">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {c.billing_phone}
          </a>
        ) : undefined
      },
      { key: "billing_address", label: "Billing Address", span: true },
    ],
  },
  {
    icon: Tag,
    fields: [
      { key: "company_status", label: "Lifecycle Status" },
      { key: "source", label: "Acquisition Source" },
      {
        key: "tags", label: "Tags", span: true,
        render: (c) => c.tags && c.tags.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {c.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground border border-border">
                <Tag className="h-3 w-3 text-muted-foreground" /> {tag}
              </span>
            ))}
          </span>
        ) : undefined
      },
    ],
  },
];

function DataRow({ label, value, span, copyable }: { label: string; value?: React.ReactNode; span?: boolean; copyable?: string }) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };
  return (
    <div className={`space-y-1 ${span ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {copyable && value && (
          <button type="button" onClick={() => handleCopy(copyable)} className="text-muted-foreground/60 hover:text-foreground transition-colors" title={`Copy ${label}`}>
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="text-sm font-medium text-foreground">
        {value === undefined || value === null || value === "" ? <span className="text-muted-foreground/50 font-normal">—</span> : value}
      </div>
    </div>
  );
}

function DataSection({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function CompanyDetailPage() {
  const { tenantSlug = "", companyId } = useParams<{ tenantSlug?: string; companyId: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading: loading } = useCompanyById(companyId ?? "");

  if (loading && !company) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading company details…</div>;
  }
  if (!company) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Company not found.</div>;
  }

  const leadsCount = company._count?.leads ?? company.leads?.length ?? 0;
  const initials = company.name.substring(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-border/60 pb-5 min-w-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/${tenantSlug}/companies`)}
          className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          title="Back to companies"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
          {initials}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground truncate">{company.name}</h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusVariant[company.company_status] ?? ""}`}>
              {company.company_status}
            </span>
            {company.size && (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sizeVariant[company.size] ?? "bg-muted text-muted-foreground"}`}>
                {company.size}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {company.legal_name && <span className="truncate">Legal: {company.legal_name}</span>}
            {company.industry && <span>· {company.industry}</span>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Globe className="h-3 w-3" /> {company.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Annual Revenue", value: formatINR(company.annual_revenue, { showZeroAsDash: true }) },
          { label: "GSTIN / Tax ID", value: company.gst_number },
          { label: "PAN Number", value: company.pan_number },
          { label: "Associated Leads", value: `${leadsCount} Accounts` },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
            <p className="text-xs font-bold font-mono text-foreground mt-1 truncate">
              {tile.value || <span className="text-muted-foreground/60 font-normal font-sans">—</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Data sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {SECTIONS.map((section, i) => (
          <DataSection key={i} icon={section.icon} title={companyStepMeta[i].label} subtitle={companyStepMeta[i].subtitle}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {section.fields.map((f) => (
                <DataRow
                  key={f.key}
                  label={f.label}
                  span={f.span}
                  copyable={f.copyable ? (company[f.key] as string | undefined) : undefined}
                  value={f.render ? f.render(company) : (company[f.key] as React.ReactNode)}
                />
              ))}
              {i === 2 && (company.city || company.country) && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground sm:col-span-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {[company.city, company.state, company.country, company.postal_code].filter(Boolean).join(", ")}
                </div>
              )}
              {i === 5 && (
                <DataRow
                  label="Associated Lead Records"
                  value={<span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span>{leadsCount} Leads linked</span></span>}
                />
              )}
            </div>
          </DataSection>
        ))}
      </div>
    </div>
  );
}

export default CompanyDetailPage;