// src/features/companies/pages/CompanyDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, href } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Globe, Mail, Phone, MapPin, Tag, User, Pencil, Trash2, Check, X, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCompanyDetail, deleteCompany, fetchCompany, updateCompany } from "@/features/companies/slice";
import type { Company, UpdateCompany } from "@/features/companies/company.types";
import { CompanySize, CompanyStatus } from "@/features/companies/company.validate";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CompanyStepErrors, companyStepMeta, validateCompanyStep } from "@/features/companies/company-wizard.schma";
const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";

const statusVariant: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-muted text-slate-600 border-slate-200",
  PROSPECT: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function ReadRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-slate-400">{label.toUpperCase()}</p>
      <p className="text-sm text-slate-800">
        {value === undefined || value === null || value === "" ? (
          <span className="text-slate-400">—</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function EditField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium tracking-wide text-slate-500">{label.toUpperCase()}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, editing, onEditToggle,
  onSave, onCancel, saving, children,
}: {
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
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-300">{title}</h2>
          <p className="text-xs text-slate-400 ">{subtitle}</p>
        </div>
        {!editing ? (
          <button
            onClick={onEditToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-cyan-600"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-60"
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
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
      // owner_name: rest.leads?.[0]?.owner_name ?? undefined,
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

  const saveSection = async () => {
    if (!companyId || !draft || editingStep === null) return;
    const { success, errors: stepErrors } = validateCompanyStep(editingStep, draft);
    if (!success) return setErrors(stepErrors);

    setSaving(true);
    try {
      await dispatch(updateCompany({ id: companyId, data: draft })).unwrap();
      toast.success("Company updated");
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
      navigate("/companies");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to delete company");
    }
  };

  if (loading && !company) {
    return <div className="p-10 text-center text-sm text-slate-400">Loading company…</div>;
  }

  if (!company) {
    return <div className="p-10 text-center text-sm text-slate-400">Company not found.</div>;
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Back to companies"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{company.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusVariant[company.company_status] ?? ""
                  }`}
              >
                {company.company_status}
              </span>
              {company.industry && (
                <span className="text-xs text-slate-400">{company.industry}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setConfirmDelete(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete company"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Profile section */}
        <SectionCard
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
              <EditField label="Company name" error={errors.name}>
                <input className={inputClass} value={draft.name ?? ""} onChange={(e) => update("name", e.target.value)} />
              </EditField>
              <EditField label="Legal name" error={errors.legal_name}>
                <input className={inputClass} value={draft.legal_name ?? ""} onChange={(e) => update("legal_name", e.target.value)} />
              </EditField>
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Industry" error={errors.industry}>
                  <input className={inputClass} value={draft.industry ?? ""} onChange={(e) => update("industry", e.target.value)} />
                </EditField>
                <EditField label="Company size" error={errors.size}>
                  <select className={inputClass} value={draft.size ?? ""} onChange={(e) => update("size", e.target.value as CompanySize)}>
                    <option value="">Select size</option>
                    {CompanySize.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </EditField>
              </div>
              <EditField label="Annual revenue" error={errors.annual_revenue}>
                <input
                  type="number"
                  className={inputClass}
                  value={draft.annual_revenue ?? ""}
                  onChange={(e) => update("annual_revenue", e.target.value ? Number(e.target.value) : undefined)}
                />
              </EditField>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ReadRow label="Company name" value={company.name} />
              <ReadRow label="Legal name" value={company.legal_name} />
              <ReadRow label="Industry" value={company.industry} />
              <ReadRow label="Company size" value={company.size} />
              <ReadRow label="Annual revenue" value={formatCurrency(company.annual_revenue)} />
            </div>
          )}
        </SectionCard>

        {/* Contact section */}
        <SectionCard
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
              <EditField label="Website" error={errors.website}>
                <input className={inputClass} value={draft.website ?? ""} onChange={(e) => update("website", e.target.value)} />
              </EditField>
              <EditField label="Email" error={errors.email}>
                <input type="email" className={inputClass} value={draft.email ?? ""} onChange={(e) => update("email", e.target.value)} />
              </EditField>
              <EditField label="Phone" error={errors.phone}>
                <input className={inputClass} value={draft.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
              </EditField>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ReadRow
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-600 hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : undefined
                }
              />
              <ReadRow
                label="Email"
                value={
                  company.email ? (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {company.email}
                    </span>
                  ) : undefined
                }
              />
              <ReadRow
                label="Phone"
                value={
                  company.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {company.phone}
                    </span>
                  ) : undefined
                }
              />
            </div>
          )}
        </SectionCard>

        {/* Address section */}
        <SectionCard
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
                <input className={inputClass} value={draft.address_line1 ?? ""} onChange={(e) => update("address_line1", e.target.value)} />
              </EditField>
              <EditField label="Address line 2" error={errors.address_line2}>
                <input className={inputClass} value={draft.address_line2 ?? ""} onChange={(e) => update("address_line2", e.target.value)} />
              </EditField>
              <div className="grid grid-cols-2 gap-4">
                <EditField label="City" error={errors.city}>
                  <input className={inputClass} value={draft.city ?? ""} onChange={(e) => update("city", e.target.value)} />
                </EditField>
                <EditField label="State" error={errors.state}>
                  <input className={inputClass} value={draft.state ?? ""} onChange={(e) => update("state", e.target.value)} />
                </EditField>
                <EditField label="Country" error={errors.country}>
                  <input className={inputClass} value={draft.country ?? ""} onChange={(e) => update("country", e.target.value)} />
                </EditField>
                <EditField label="Postal code" error={errors.postal_code}>
                  <input className={inputClass} value={draft.postal_code ?? ""} onChange={(e) => update("postal_code", e.target.value)} />
                </EditField>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ReadRow label="Address line 1" value={company.address_line1} />
              <ReadRow label="Address line 2" value={company.address_line2} />
              <ReadRow label="City" value={company.city} />
              <ReadRow label="State" value={company.state} />
              <ReadRow label="Country" value={company.country} />
              <ReadRow label="Postal code" value={company.postal_code} />
              {(company.city || company.country) && (
                <div className="col-span-2 flex items-center gap-1.5 pt-1 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Pipeline section */}
        <SectionCard
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
              <EditField label="Status" error={errors.company_status}>
                <select
                  className={inputClass}
                  value={draft.company_status ?? "ACTIVE"}
                  onChange={(e) => update("company_status", e.target.value as CompanyStatus)}
                >
                  {CompanyStatus.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </EditField>
              <EditField label="Source" error={errors.source}>
                <input className={inputClass} value={draft.source ?? ""} onChange={(e) => update("source", e.target.value)} />
              </EditField>
              <EditField label="Tags" error={errors.tags as string | undefined}>
                <input
                  className={inputClass}
                  value={draft.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    update("tags", e.target.value ? e.target.value.split(",").map((t) => t.trim()).filter(Boolean) : [])
                  }
                />
              </EditField>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ReadRow label="Status" value={company.company_status} />
              <ReadRow label="Source" value={company.source} />
              {/* <ReadRow label="Owner" value={company.leads?.[0]?.owner_name ? <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" />{company.leads?.[0]?.owner_name}</span> : undefined} /> */}
              <ReadRow
                label="Tags"
                value={
                  company.tags && company.tags.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5">
                      {company.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : undefined
                }
              />
              <ReadRow label="Total leads" value={company._count?.leads ?? 0} />
            </div>
          )}
        </SectionCard>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {company.name}. Related leads may also be removed by the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete company</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}