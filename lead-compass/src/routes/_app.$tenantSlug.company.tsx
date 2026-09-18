import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Building2, Globe, Mail, Phone, MapPin, Tag, Pencil,
    Trash2, Check, X, FileCheck2, CreditCard, Copy, Users, ExternalLink,
} from "lucide-react";
import { useCompanyMutation, useOwnCompany, useOwnCompanyMutation } from "@/features/companies/hooks/useCompanies";
import { CompanySize, CompanyStatus } from "@/features/companies/company.validate";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyStepErrors, companyStepMeta, validateCompanyStep } from "@/features/companies/company-wizard.schma";
import { formatCurrency, formatINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Company, UpdateCompany } from "@/features/companies/types/companies.types";

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

type FieldType = "text" | "number" | "select" | "textarea";

interface FieldConfig {
    key: keyof UpdateCompany;
    label: string;
    type?: FieldType;
    placeholder?: string;
    options?: readonly string[];
    span?: boolean;
    copyable?: boolean;
    mono?: boolean;
    /** Custom read-mode renderer; falls back to plain text when omitted. */
    render?: (company: Company) => React.ReactNode;
}

interface SectionConfig {
    icon: React.ComponentType<{ className?: string }>;
    fields: FieldConfig[];
}

// One entry per wizard step (companyStepMeta[i] supplies the title/subtitle).
// This table is the single source of truth for both edit-mode inputs and
// read-mode display — add a field here once, it renders in both modes.
const SECTIONS: SectionConfig[] = [
    {
        icon: Building2,
        fields: [
            { key: "name", label: "Company name *" },
            { key: "legal_name", label: "Legal entity name", placeholder: "e.g. Acme Technologies Private Limited" },
            { key: "industry", label: "Industry", placeholder: "e.g. SaaS / FinTech" },
            { key: "size", label: "Company size", type: "select", options: CompanySize },
            {
                key: "annual_revenue", label: "Annual revenue (₹ INR)", type: "number",
                placeholder: "e.g. 5000000", span: true,
                render: (c) => c.annual_revenue != null ? <span className="font-mono">{formatCurrency(c.annual_revenue)}</span> : undefined,
            },
        ],
    },
    {
        icon: Globe,
        fields: [
            {
                key: "website", label: "Website URL", placeholder: "https://example.com", span: true,
                render: (c) => c.website ? (
                    <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" /> {c.website.replace(/^https?:\/\//, "")}
                    </a>
                ) : undefined
            },
            {
                key: "email", label: "Primary email", placeholder: "contact@company.com",
                render: (c) => c.email ? (
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:underline">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {c.email}
                    </a>
                ) : undefined
            },
            {
                key: "phone", label: "Phone number", placeholder: "+91 98765 43210",
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
            { key: "address_line1", label: "Address line 1", placeholder: "Street / Building" },
            { key: "address_line2", label: "Address line 2", placeholder: "Suite / Floor / Landmark" },
            { key: "city", label: "City", placeholder: "e.g. Mumbai" },
            { key: "state", label: "State / Province", placeholder: "e.g. Maharashtra" },
            { key: "country", label: "Country", placeholder: "e.g. India" },
            { key: "postal_code", label: "Postal / PIN code", placeholder: "e.g. 400001" },
        ],
    },
    {
        icon: FileCheck2,
        fields: [
            { key: "gst_number", label: "GST number (GSTIN)", placeholder: "e.g. 27AAPFU0939F1ZV", mono: true, copyable: true },
            { key: "pan_number", label: "PAN number", placeholder: "e.g. AAPFU0939F", mono: true, copyable: true },
            { key: "place_of_supply", label: "Place of supply", placeholder: "e.g. 27-Maharashtra", span: true },
        ],
    },
    {
        icon: CreditCard,
        fields: [
            {
                key: "billing_email", label: "Dedicated billing email", placeholder: "billing@company.com",
                render: (c) => c.billing_email ? (
                    <a href={`mailto:${c.billing_email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {c.billing_email}
                    </a>
                ) : undefined
            },
            {
                key: "billing_phone", label: "Billing phone", placeholder: "+91 98765 43210",
                render: (c) => c.billing_phone ? (
                    <a href={`tel:${c.billing_phone}`} className="inline-flex items-center gap-1 font-mono hover:underline">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {c.billing_phone}
                    </a>
                ) : undefined
            },
            {
                key: "billing_address", label: "Dedicated billing address", type: "textarea",
                placeholder: "Accounts Payable, Suite 400, Financial District...", span: true
            },
        ],
    },
    {
        icon: Tag,
        fields: [
            { key: "company_status", label: "Company status", type: "select", options: CompanyStatus },
            { key: "source", label: "Acquisition source", placeholder: "e.g. Outbound Campaign, Referral" },
            {
                key: "tags", label: "Metadata tags", span: true,
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

function ReadRow({ label, value, span, copyable }: { label: string; value?: React.ReactNode; span?: boolean; copyable?: string }) {
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

function EditField({ label, error, span, children }: { label: string; error?: string; span?: boolean; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 ${span ? "sm:col-span-2" : ""}`}>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SectionCard({
    icon: Icon, title, subtitle, editing, onEditToggle, onSave, onCancel, saving, children,
}: {
    icon: React.ComponentType<{ className?: string }>;
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
        <div className={`rounded-xl border bg-card shadow-xs transition-all ${editing ? "ring-2 ring-primary/40 border-primary/50" : "border-border/70 hover:border-border"}`}>
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                </div>
                {!editing ? (
                    <Button variant="ghost" size="sm" onClick={onEditToggle} aria-label={`Edit ${title}`} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving} className="h-8 px-2.5 text-xs text-muted-foreground">
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={onSave} disabled={saving} className="h-8 px-3 text-xs">
                            <Check className="h-3.5 w-3.5 mr-1" /> Save
                        </Button>
                    </div>
                )}
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

export default function OwnCompany() {
    const navigate = useNavigate();
    const { data: company, isLoading: loading } = useOwnCompany();
    const { delete: deleteCompany } = useCompanyMutation();
    const { update: updateCompany } = useOwnCompanyMutation();

    const [editingStep, setEditingStep] = useState<number | null>(null);
    const [draft, setDraft] = useState<UpdateCompany | null>(null);
    const [errors, setErrors] = useState<CompanyStepErrors>({});
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const draftFromCompany = (c: Company): UpdateCompany => {
        const { id: _id, tenant_id: _tenant_id, created_at: _created_at, _count: _count, ...rest } = c;
        const normalized = Object.fromEntries(
            Object.entries(rest).map(([key, value]) => [key, value === null ? undefined : value])
        ) as UpdateCompany;
        return { ...normalized, tags: rest.tags ?? [] };
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
        if (!company?.id || !draft || editingStep === null) return;
        const { success, errors: stepErrors } = validateCompanyStep(editingStep, draft);
        if (!success) return setErrors(stepErrors);

        setSaving(true);
        try {
            await updateCompany.mutateAsync(draft);
            toast.success("Company profile updated successfully");
            cancelEdit();
        } catch (error) {
            toast.error(typeof error === "string" ? error : "Failed to update company");
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!company?.id) return;
        try {
            await deleteCompany.mutateAsync(company.id);
            toast.success("Company deleted");
            navigate(-1);
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
    const initials = company.name?.substring(0, 2).toUpperCase();

    const renderField = (field: FieldConfig) => {
        if (editingStep === null || !draft) return null;
        const value = draft[field.key];

        if (field.type === "select") {
            return (
                <EditField key={field.key} label={field.label} error={errors[field.key] as string | undefined} span={field.span}>
                    <select className={inputClass} value={(value as string) ?? ""} onChange={(e) => update(field.key, e.target.value as never)}>
                        {field.key === "size" && <option value="">Select size</option>}
                        {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                </EditField>
            );
        }
        if (field.type === "textarea") {
            return (
                <EditField key={field.key} label={field.label} error={errors[field.key] as string | undefined} span={field.span}>
                    <textarea rows={2} className={inputClass} value={(value as string) ?? ""} placeholder={field.placeholder}
                        onChange={(e) => update(field.key, e.target.value as never)} />
                </EditField>
            );
        }
        if (field.key === "tags") {
            return (
                <EditField key={field.key} label={field.label} error={errors.tags as string | undefined} span={field.span}>
                    <input className={inputClass} value={(draft.tags ?? []).join(", ")} placeholder="Tier-1, Enterprise, Strategic"
                        onChange={(e) => update("tags", e.target.value ? e.target.value.split(",").map((t) => t.trim()).filter(Boolean) : [])} />
                    <p className="text-[11px] text-muted-foreground">Separate tags with commas.</p>
                </EditField>
            );
        }
        return (
            <EditField key={field.key} label={field.label} error={errors[field.key] as string | undefined} span={field.span}>
                <input
                    type={field.type === "number" ? "number" : "text"}
                    className={`${inputClass} ${field.mono ? "font-mono uppercase" : ""}`}
                    value={(value as string | number) ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                        update(field.key, field.type === "number"
                            ? (e.target.value ? Number(e.target.value) : undefined) as never
                            : (field.mono ? e.target.value.toUpperCase() : e.target.value) as never)
                    }
                />
            </EditField>
        );
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                <div className="flex items-center gap-3.5 min-w-0">
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

                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete company"
                    className="h-9 w-9 p-0 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg">
                    <Trash2 className="h-4 w-4" />
                </Button>
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

            {/* Sections */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" onKeyDown={editingStep !== null ? handleFormKeyDown : undefined}>
                {SECTIONS.map((section, i) => (
                    <SectionCard
                        key={i}
                        icon={section.icon}
                        title={companyStepMeta[i].label}
                        subtitle={companyStepMeta[i].subtitle}
                        editing={editingStep === i}
                        onEditToggle={() => startEdit(i)}
                        onSave={saveSection}
                        onCancel={cancelEdit}
                        saving={saving}
                    >
                        {editingStep === i && draft ? (
                            <div className="space-y-4">{section.fields.map(renderField)}</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                {section.fields.map((f) => (
                                    <ReadRow
                                        key={f.key}
                                        label={f.label.replace(" *", "")}
                                        span={f.span}
                                        copyable={f.copyable ? (company[f.key] as string | undefined) : undefined}
                                        value={f.render ? f.render(company) : (company[f.key] as React.ReactNode)}
                                    />
                                ))}
                                {i === 5 && (
                                    <ReadRow
                                        label="Associated Lead Records"
                                        value={<span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span>{leadsCount} Leads linked</span></span>}
                                    />
                                )}
                            </div>
                        )}
                    </SectionCard>
                ))}
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this company?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <span className="font-semibold text-foreground">{company.name}</span> from the workspace. Associated contacts or leads will be unlinked.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Company
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}