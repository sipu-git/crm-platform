import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Tag,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Receipt,
  FileCheck2,
  CreditCard,
  Copy,
  Users,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCompanyDetail, deleteCompany, fetchCompany, updateCompany } from "@/features/companies/slice";
import type { Company, UpdateCompany } from "@/features/companies/company.types";
import { CompanySize, CompanyStatus } from "@/features/companies/company.validate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyStepErrors, companyStepMeta, validateCompanyStep } from "@/features/companies/company-wizard.schma";
import { formatCurrency, formatINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary";

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

/** Two-column read layout that collapses to one column on small screens */
function ReadGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>;
}

function ReadRow({
  label,
  value,
  span,
  copyable,
}: {
  label: string;
  value?: React.ReactNode;
  span?: boolean;
  copyable?: string;
}) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <div className={`space-y-1 ${span ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {copyable && value && (
          <button
            type="button"
            onClick={() => handleCopy(copyable)}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
            title={`Copy ${label}`}
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="text-sm font-medium text-foreground">
        {value === undefined || value === null || value === "" ? (
          <span className="text-muted-foreground/50 font-normal">—</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function EditField({
  label,
  error,
  span,
  children,
}: {
  label: string;
  error?: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${span ? "sm:col-span-2" : ""}`}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  editing,
  onEditToggle,
  onSave,
  onCancel,
  saving,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  editing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border bg-card shadow-xs transition-all ${
        editing ? "ring-2 ring-primary/40 border-primary/50" : "border-border/70 hover:border-border"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditToggle}
            aria-label={`Edit ${title}`}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={saving}
              aria-label="Cancel"
              className="h-8 px-2.5 text-xs text-muted-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              aria-label="Save"
              className="h-8 px-3 text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          </div>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function CompanyDetailPage() {
  const { tenantSlug = "", companyId } = useParams<{ tenantSlug?: string; companyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const company = useAppSelector((state) => state.companies.companyDetail);
  const loading = useAppSelector((state) => state.companies.loading);

  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [draft, setDraft] = useState<UpdateCompany | null>(null);
  const [errors, setErrors] = useState<CompanyStepErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (companyId) dispatch(fetchCompany(companyId));
    return () => {
      dispatch(clearCompanyDetail());
    };
  }, [companyId, dispatch]);

  const draftFromCompany = (c: Company): UpdateCompany => {
    const { id: _id, tenant_id: _tenant_id, created_at: _created_at, _count: _count, ...rest } = c;
    return {
      name: rest.name ?? undefined,
      legal_name: rest.legal_name ?? undefined,
      industry: rest.industry ?? undefined,
      size: rest.size ?? undefined,
      annual_revenue: rest.annual_revenue ?? undefined,
      company_status: rest.company_status ?? undefined,
      website: rest.website ?? undefined,
      email: rest.email ?? undefined,
      phone: rest.phone ?? undefined,
      address_line1: rest.address_line1 ?? undefined,
      address_line2: rest.address_line2 ?? undefined,
      city: rest.city ?? undefined,
      state: rest.state ?? undefined,
      country: rest.country ?? undefined,
      postal_code: rest.postal_code ?? undefined,
      gst_number: rest.gst_number ?? undefined,
      pan_number: rest.pan_number ?? undefined,
      place_of_supply: rest.place_of_supply ?? undefined,
      billing_email: rest.billing_email ?? undefined,
      billing_phone: rest.billing_phone ?? undefined,
      billing_address: rest.billing_address ?? undefined,
      source: rest.source ?? undefined,
      tags: rest.tags ?? [],
      custom_fields: rest.custom_fields ?? undefined,
    };
  };

  const startEdit = (step: number) => {
    if (!company) return;
    setDraft(draftFromCompany(company));
    setErrors({});
    setEditingStep(step);
  };

  const cancelEdit = () => {
    setDraft(null);
    setErrors({});
    setEditingStep(null);
  };

  const update = <K extends keyof UpdateCompany>(key: K, value: UpdateCompany[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target as HTMLElement).matches("textarea")) {
      e.preventDefault();
      saveSection();
    }
    if (e.key === "Escape") cancelEdit();
  };

  const saveSection = async () => {
    if (!companyId || !draft || editingStep === null) return;
    const { success, errors: stepErrors } = validateCompanyStep(editingStep, draft);
    if (!success) return setErrors(stepErrors);

    setSaving(true);
    try {
      await dispatch(updateCompany({ id: companyId, data: draft })).unwrap();
      toast.success("Company profile updated successfully");
      cancelEdit();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!companyId) return;
    try {
      await dispatch(deleteCompany(companyId)).unwrap();
      toast.success("Company deleted");
      navigate(`/${tenantSlug}/companies`);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to delete company");
    }
  };

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
      {/* Top Navigation & Breadcrumb Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5 min-w-0">
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
              <h1 className="text-xl font-bold tracking-tight text-foreground truncate font-sans">
                {company.name}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  statusVariant[company.company_status] ?? ""
                }`}
              >
                {company.company_status}
              </span>
              {company.size && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    sizeVariant[company.size] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {company.size}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {company.legal_name && (
                <span className="truncate">Legal: {company.legal_name}</span>
              )}
              {company.industry && <span>· {company.industry}</span>}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {company.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/${tenantSlug}/invoices/new`)}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span>Create Invoice</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete company"
            className="h-9 w-9 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Hero Stat Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Annual Revenue
          </p>
          <p className="text-base font-bold font-mono text-foreground mt-1">
            {formatINR(company.annual_revenue, { showZeroAsDash: true })}
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            GSTIN / Tax ID
          </p>
          <p className="text-xs font-bold font-mono text-foreground mt-1 truncate">
            {company.gst_number || <span className="text-muted-foreground/60 font-normal font-sans">—</span>}
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            PAN Number
          </p>
          <p className="text-xs font-bold font-mono text-foreground mt-1 truncate">
            {company.pan_number || <span className="text-muted-foreground/60 font-normal font-sans">—</span>}
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Associated Leads
          </p>
          <p className="text-base font-bold font-mono text-foreground mt-1">
            {leadsCount} <span className="text-xs font-normal text-muted-foreground font-sans">Accounts</span>
          </p>
        </div>
      </div>

      {/* Sections Grid — 2 columns on desktop */}
      <div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        onKeyDown={editingStep !== null ? handleFormKeyDown : undefined}
      >
        {/* Section 0: Basic Info & Identity */}
        <SectionCard
          icon={Building2}
          title={companyStepMeta[0].label}
          subtitle={companyStepMeta[0].subtitle}
          editing={editingStep === 0}
          onEditToggle={() => startEdit(0)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 0 && draft ? (
            <div className="space-y-4">
              <EditField label="Company name *" error={errors.name}>
                <input
                  className={inputClass}
                  value={draft.name ?? ""}
                  onChange={(e) => update("name", e.target.value)}
                  autoFocus
                />
              </EditField>
              <EditField label="Legal entity name" error={errors.legal_name}>
                <input
                  className={inputClass}
                  value={draft.legal_name ?? ""}
                  onChange={(e) => update("legal_name", e.target.value)}
                  placeholder="e.g. Acme Technologies Private Limited"
                />
              </EditField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField label="Industry" error={errors.industry}>
                  <input
                    className={inputClass}
                    value={draft.industry ?? ""}
                    onChange={(e) => update("industry", e.target.value)}
                    placeholder="e.g. SaaS / FinTech"
                  />
                </EditField>
                <EditField label="Company size" error={errors.size}>
                  <select
                    className={inputClass}
                    value={draft.size ?? ""}
                    onChange={(e) => update("size", e.target.value as CompanySize)}
                  >
                    <option value="">Select size</option>
                    {CompanySize.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </EditField>
              </div>
              <EditField label="Annual revenue (₹ INR)" error={errors.annual_revenue}>
                <input
                  type="number"
                  className={inputClass}
                  value={draft.annual_revenue ?? ""}
                  onChange={(e) =>
                    update("annual_revenue", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="e.g. 5000000"
                />
              </EditField>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow label="Company Name" value={company.name} />
              <ReadRow label="Legal Name" value={company.legal_name} />
              <ReadRow label="Industry" value={company.industry} />
              <ReadRow label="Company Size" value={company.size} />
              <ReadRow
                label="Annual Revenue"
                value={
                  company.annual_revenue != null ? (
                    <span className="font-mono">{formatCurrency(company.annual_revenue)}</span>
                  ) : undefined
                }
                span
              />
            </ReadGrid>
          )}
        </SectionCard>

        {/* Section 1: Contact & Web */}
        <SectionCard
          icon={Globe}
          title={companyStepMeta[1].label}
          subtitle={companyStepMeta[1].subtitle}
          editing={editingStep === 1}
          onEditToggle={() => startEdit(1)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 1 && draft ? (
            <div className="space-y-4">
              <EditField label="Website URL" error={errors.website}>
                <input
                  className={inputClass}
                  value={draft.website ?? ""}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                />
              </EditField>
              <EditField label="Primary email" error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={draft.email ?? ""}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contact@company.com"
                />
              </EditField>
              <EditField label="Phone number" error={errors.phone}>
                <input
                  className={inputClass}
                  value={draft.phone ?? ""}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </EditField>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : undefined
                }
                span
              />
              <ReadRow
                label="Primary Email"
                value={
                  company.email ? (
                    <a
                      href={`mailto:${company.email}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {company.email}
                    </a>
                  ) : undefined
                }
              />
              <ReadRow
                label="Phone Number"
                value={
                  company.phone ? (
                    <a
                      href={`tel:${company.phone}`}
                      className="inline-flex items-center gap-1 hover:underline font-mono"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {company.phone}
                    </a>
                  ) : undefined
                }
              />
            </ReadGrid>
          )}
        </SectionCard>

        {/* Section 2: Physical Address & Location */}
        <SectionCard
          icon={MapPin}
          title={companyStepMeta[2].label}
          subtitle={companyStepMeta[2].subtitle}
          editing={editingStep === 2}
          onEditToggle={() => startEdit(2)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 2 && draft ? (
            <div className="space-y-4">
              <EditField label="Address line 1" error={errors.address_line1}>
                <input
                  className={inputClass}
                  value={draft.address_line1 ?? ""}
                  onChange={(e) => update("address_line1", e.target.value)}
                  placeholder="Street / Building"
                  autoFocus
                />
              </EditField>
              <EditField label="Address line 2" error={errors.address_line2}>
                <input
                  className={inputClass}
                  value={draft.address_line2 ?? ""}
                  onChange={(e) => update("address_line2", e.target.value)}
                  placeholder="Suite / Floor / Landmark"
                />
              </EditField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField label="City" error={errors.city}>
                  <input
                    className={inputClass}
                    value={draft.city ?? ""}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </EditField>
                <EditField label="State / Province" error={errors.state}>
                  <input
                    className={inputClass}
                    value={draft.state ?? ""}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="e.g. Maharashtra"
                  />
                </EditField>
                <EditField label="Country" error={errors.country}>
                  <input
                    className={inputClass}
                    value={draft.country ?? ""}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="e.g. India"
                  />
                </EditField>
                <EditField label="Postal / PIN code" error={errors.postal_code}>
                  <input
                    className={inputClass}
                    value={draft.postal_code ?? ""}
                    onChange={(e) => update("postal_code", e.target.value)}
                    placeholder="e.g. 400001"
                  />
                </EditField>
              </div>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow label="Address Line 1" value={company.address_line1} />
              <ReadRow label="Address Line 2" value={company.address_line2} />
              <ReadRow label="City" value={company.city} />
              <ReadRow label="State" value={company.state} />
              <ReadRow label="Country" value={company.country} />
              <ReadRow label="Postal Code" value={company.postal_code} />
              {(company.city || company.country) && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground sm:col-span-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {[company.city, company.state, company.country, company.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </ReadGrid>
          )}
        </SectionCard>

        {/* Section 3: Tax & Statutory Compliance (NEW SECTION) */}
        <SectionCard
          icon={FileCheck2}
          title={companyStepMeta[3].label}
          subtitle={companyStepMeta[3].subtitle}
          editing={editingStep === 3}
          onEditToggle={() => startEdit(3)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 3 && draft ? (
            <div className="space-y-4">
              <EditField label="GST number (GSTIN)" error={errors.gst_number}>
                <input
                  className={`${inputClass} font-mono uppercase`}
                  value={draft.gst_number ?? ""}
                  onChange={(e) => update("gst_number", e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  autoFocus
                />
              </EditField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField label="PAN number" error={errors.pan_number}>
                  <input
                    className={`${inputClass} font-mono uppercase`}
                    value={draft.pan_number ?? ""}
                    onChange={(e) => update("pan_number", e.target.value.toUpperCase())}
                    placeholder="e.g. AAPFU0939F"
                  />
                </EditField>
                <EditField label="Place of supply" error={errors.place_of_supply}>
                  <input
                    className={inputClass}
                    value={draft.place_of_supply ?? ""}
                    onChange={(e) => update("place_of_supply", e.target.value)}
                    placeholder="e.g. 27-Maharashtra"
                  />
                </EditField>
              </div>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow
                label="GSTIN / GST Number"
                value={
                  company.gst_number ? (
                    <span className="font-mono font-semibold text-foreground tracking-wide">
                      {company.gst_number}
                    </span>
                  ) : undefined
                }
                copyable={company.gst_number ?? undefined}
              />
              <ReadRow
                label="PAN Number"
                value={
                  company.pan_number ? (
                    <span className="font-mono font-semibold text-foreground tracking-wide">
                      {company.pan_number}
                    </span>
                  ) : undefined
                }
                copyable={company.pan_number ?? undefined}
              />
              <ReadRow
                label="Place of Supply"
                value={company.place_of_supply}
                span
              />
            </ReadGrid>
          )}
        </SectionCard>

        {/* Section 4: Billing & Invoicing Information (NEW SECTION) */}
        <SectionCard
          icon={CreditCard}
          title={companyStepMeta[4].label}
          subtitle={companyStepMeta[4].subtitle}
          editing={editingStep === 4}
          onEditToggle={() => startEdit(4)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 4 && draft ? (
            <div className="space-y-4">
              <EditField label="Dedicated billing email" error={errors.billing_email}>
                <input
                  type="email"
                  className={inputClass}
                  value={draft.billing_email ?? ""}
                  onChange={(e) => update("billing_email", e.target.value)}
                  placeholder="billing@company.com"
                  autoFocus
                />
              </EditField>
              <EditField label="Billing phone" error={errors.billing_phone}>
                <input
                  className={inputClass}
                  value={draft.billing_phone ?? ""}
                  onChange={(e) => update("billing_phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </EditField>
              <EditField label="Dedicated billing address" error={errors.billing_address}>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={draft.billing_address ?? ""}
                  onChange={(e) => update("billing_address", e.target.value)}
                  placeholder="Accounts Payable, Suite 400, Financial District..."
                />
              </EditField>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow
                label="Billing Email"
                value={
                  company.billing_email ? (
                    <a
                      href={`mailto:${company.billing_email}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" /> {company.billing_email}
                    </a>
                  ) : undefined
                }
              />
              <ReadRow
                label="Billing Phone"
                value={
                  company.billing_phone ? (
                    <a
                      href={`tel:${company.billing_phone}`}
                      className="inline-flex items-center gap-1 font-mono hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {company.billing_phone}
                    </a>
                  ) : undefined
                }
              />
              <ReadRow
                label="Billing Address"
                value={company.billing_address}
                span
              />
            </ReadGrid>
          )}
        </SectionCard>

        {/* Section 5: Additional Details & Tags */}
        <SectionCard
          icon={Tag}
          title={companyStepMeta[5].label}
          subtitle={companyStepMeta[5].subtitle}
          editing={editingStep === 5}
          onEditToggle={() => startEdit(5)}
          onSave={saveSection}
          onCancel={cancelEdit}
          saving={saving}
        >
          {editingStep === 5 && draft ? (
            <div className="space-y-4">
              <EditField label="Company status" error={errors.company_status}>
                <select
                  className={inputClass}
                  value={draft.company_status ?? "ACTIVE"}
                  onChange={(e) => update("company_status", e.target.value as CompanyStatus)}
                  autoFocus
                >
                  {CompanyStatus.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </EditField>
              <EditField label="Acquisition source" error={errors.source}>
                <input
                  className={inputClass}
                  value={draft.source ?? ""}
                  onChange={(e) => update("source", e.target.value)}
                  placeholder="e.g. Outbound Campaign, Referral"
                />
              </EditField>
              <EditField label="Metadata tags" error={errors.tags as string | undefined}>
                <input
                  className={inputClass}
                  value={draft.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    update(
                      "tags",
                      e.target.value
                        ? e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                        : []
                    )
                  }
                  placeholder="Tier-1, Enterprise, Strategic"
                />
                <p className="text-[11px] text-muted-foreground">Separate tags with commas.</p>
              </EditField>
            </div>
          ) : (
            <ReadGrid>
              <ReadRow label="Lifecycle Status" value={company.company_status} />
              <ReadRow label="Acquisition Source" value={company.source} />
              <ReadRow
                label="Tags"
                value={
                  company.tags && company.tags.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5">
                      {company.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground border border-border"
                        >
                          <Tag className="h-3 w-3 text-muted-foreground" /> {tag}
                        </span>
                      ))}
                    </span>
                  ) : undefined
                }
                span
              />
              <ReadRow
                label="Associated Lead Records"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{leadsCount} Leads linked</span>
                  </span>
                }
              />
            </ReadGrid>
          )}
        </SectionCard>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold text-foreground">{company.name}</span>{" "}
              from the workspace. Associated contacts or leads will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CompanyDetailPage;