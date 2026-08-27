"use client";

import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    deleteProfile,
    fetchProfile,
    resetDeleteStatus,
    resetUpdateStatus,
    updateProfile,
} from "@/features/profiles/slice";
import { toast } from "sonner";
import {
    Building2,
    ExternalLink,
    Loader2,
    Mail,
    MapPin,
    Pencil,
    ShieldAlert,
    User,
    X,
} from "lucide-react";

const TENANT_EDIT_ROLES = ["OWNER", "ADMIN"];

const inputClass =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground";

const labelClass = "text-xs font-medium text-muted-foreground";

type TextInputProps = {
    label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

function TextInput({ label, id, ...props }: TextInputProps) {
    return (
        <label htmlFor={id} className="grid gap-1.5">
            <span className={labelClass}>{label}</span>
            <input id={id} className={inputClass} {...props} />
        </label>
    );
}

function DetailItem({
    label,
    children,
    className = "",
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <dt className={labelClass}>{label}</dt>
            <dd className="mt-1 text-sm font-medium">{children}</dd>
        </div>
    );
}

function getSafeWebsiteUrl(value?: string | null) {
    if (!value) return null;

    try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const url = new URL(normalized);

        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

export default function ProfilePage() {
    const dispatch = useAppDispatch();

    const {
        data: profile,
        fetchStatus,
        updateStatus,
        deleteStatus,
    } = useAppSelector((state) => state.profile);

    const [editingPersonal, setEditingPersonal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState("");

    const [personalForm, setPersonalForm] = useState({
        full_name: "",
        email: "",
        mobile: ""
    });

    const [companyForm, setCompanyForm] = useState({
        name: "",
        gst_number: "",
        pan_number: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        website: "",
        industry: "",
        company_size: "",
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (!profile) return;

        setPersonalForm({
            full_name: profile.user.full_name ?? "",
            email: profile.user.email ?? "",
            mobile: profile.user.mobile ?? "",
        });

        setCompanyForm({
            name: profile.tenant.name ?? "",
            gst_number: profile.tenant.gst_number ?? "",
            pan_number: profile.tenant.pan_number ?? "",
            address: profile.tenant.address ?? "",
            city: profile.tenant.city ?? "",
            state: profile.tenant.state ?? "",
            country: profile.tenant.country ?? "",
            pincode: profile.tenant.pincode ?? "",
            website: profile.tenant.website ?? "",
            industry: profile.tenant.industry ?? "",
            company_size: profile.tenant.company_size ?? "",
        });
    }, [profile]);

    if (fetchStatus === "loading" || !profile) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
                <div className="space-y-6">
                    <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
                    <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
                    <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
                </div>
            </div>
        );
    }

    const canEditCompany = TENANT_EDIT_ROLES.includes(profile.user.role);

    const initials =
        profile.user.full_name
            ?.split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name[0])
            .join("")
            .toUpperCase() || "U";

    const websiteUrl = getSafeWebsiteUrl(profile.tenant.website);

    const resetPersonalForm = () => {
        setPersonalForm({
            full_name: profile.user.full_name ?? "",
            email: profile.user.email ?? "",
            mobile:profile.user.mobile ??""
        });
    };

    const resetCompanyForm = () => {
        setCompanyForm({
            name: profile.tenant.name ?? "",
            gst_number: profile.tenant.gst_number ?? "",
            pan_number: profile.tenant.pan_number ?? "",
            address: profile.tenant.address ?? "",
            city: profile.tenant.city ?? "",
            state: profile.tenant.state ?? "",
            country: profile.tenant.country ?? "",
            pincode: profile.tenant.pincode ?? "",
            website: profile.tenant.website ?? "",
            industry: profile.tenant.industry ?? "",
            company_size: profile.tenant.company_size ?? "",
        });
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setConfirmEmail("");
        dispatch(resetDeleteStatus());
    };

    async function savePersonal(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = await dispatch(updateProfile(personalForm));

        if (updateProfile.fulfilled.match(result)) {
            toast.success("Personal details updated");
            setEditingPersonal(false);
            dispatch(resetUpdateStatus());
            return;
        }

        toast.error((result.payload as string) ?? "Could not update your details");
    }

    async function saveCompany(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = await dispatch(updateProfile(companyForm));

        if (updateProfile.fulfilled.match(result)) {
            toast.success("Company details updated");
            setEditingCompany(false);
            dispatch(resetUpdateStatus());
            return;
        }

        toast.error((result.payload as string) ?? "Could not update company details");
    }

    async function confirmDelete() {
        const result = await dispatch(
            deleteProfile({
                confirm_email: confirmEmail.trim(),
            }),
        );

        if (deleteProfile.fulfilled.match(result)) {
            toast.success("Account deleted");
            closeDeleteModal();
            return;
        }

        toast.error((result.payload as string) ?? "Could not delete account");
    }

    const address = [
        profile.tenant.address,
        profile.tenant.city,
        profile.tenant.state,
        profile.tenant.pincode,
        profile.tenant.country,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    <div className="h-2 bg-[image:var(--gradient-amber)]" />

                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-amber)] text-lg font-bold text-amber-foreground shadow-sm">
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-bold sm:text-2xl">
                                    {profile.user.full_name}
                                </h1>

                                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    {profile.user.email}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold">
                                        {profile.user.role}
                                    </span>

                                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{profile.tenant.name || "Workspace"}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
                                <User className="h-4 w-4 text-accent-foreground" />
                            </span>

                            <div>
                                <h2 className="font-semibold">Personal information</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Your account name and email address
                                </p>
                            </div>
                        </div>

                        {!editingPersonal && (
                            <button
                                type="button"
                                onClick={() => setEditingPersonal(true)}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                    </div>

                    {editingPersonal ? (
                        <form onSubmit={savePersonal} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <TextInput
                                id="full-name"
                                label="Full name"
                                required
                                autoComplete="name"
                                value={personalForm.full_name}
                                onChange={(event) =>
                                    setPersonalForm((form) => ({
                                        ...form,
                                        full_name: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="email"
                                label="Email address"
                                type="email"
                                required
                                autoComplete="email"
                                value={personalForm.email}
                                onChange={(event) =>
                                    setPersonalForm((form) => ({
                                        ...form,
                                        email: event.target.value,
                                    }))
                                }
                            />
                            <TextInput
                                id="mobile"
                                label="Mobile Number"
                                type="text"
                                required
                                autoComplete="mobile"
                                value={personalForm.mobile}
                                onChange={(event) =>
                                    setPersonalForm((form) => ({
                                        ...form,
                                        email: event.target.value,
                                    }))
                                }
                            />

                            <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={updateStatus === "loading"}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-amber)] px-4 py-2.5 text-sm font-semibold text-amber-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {updateStatus === "loading" && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Save changes
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetPersonalForm();
                                        setEditingPersonal(false);
                                    }}
                                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                            <DetailItem label="Full name">{profile.user.full_name}</DetailItem>

                            <DetailItem label="Email address">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    {profile.user.email}
                                </span>
                            </DetailItem>
                            <DetailItem label="Mobile Number">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    {profile.user.mobile}
                                </span>
                            </DetailItem>
                        </dl>
                    )}
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
                                <Building2 className="h-4 w-4 text-accent-foreground" />
                            </span>

                            <div>
                                <h2 className="font-semibold">Company details</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {canEditCompany
                                        ? "Used on invoices and shared with your workspace"
                                        : "Managed by your workspace owner or admin"}
                                </p>
                            </div>
                        </div>

                        {canEditCompany && !editingCompany && (
                            <button
                                type="button"
                                onClick={() => setEditingCompany(true)}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                    </div>

                    {editingCompany ? (
                        <form onSubmit={saveCompany} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <TextInput
                                    id="company-name"
                                    label="Company name"
                                    required
                                    autoComplete="organization"
                                    value={companyForm.name}
                                    onChange={(event) =>
                                        setCompanyForm((form) => ({
                                            ...form,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <TextInput
                                id="gst-number"
                                label="GST number"
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                                value={companyForm.gst_number}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        gst_number: event.target.value.toUpperCase(),
                                    }))
                                }
                            />

                            <TextInput
                                id="pan-number"
                                label="PAN number"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                value={companyForm.pan_number}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        pan_number: event.target.value.toUpperCase(),
                                    }))
                                }
                            />

                            <div className="sm:col-span-2">
                                <TextInput
                                    id="address"
                                    label="Address"
                                    autoComplete="street-address"
                                    value={companyForm.address}
                                    onChange={(event) =>
                                        setCompanyForm((form) => ({
                                            ...form,
                                            address: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <TextInput
                                id="city"
                                label="City"
                                autoComplete="address-level2"
                                value={companyForm.city}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        city: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="state"
                                label="State"
                                autoComplete="address-level1"
                                value={companyForm.state}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        state: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="country"
                                label="Country"
                                autoComplete="country-name"
                                value={companyForm.country}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        country: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="pincode"
                                label="Pincode"
                                autoComplete="postal-code"
                                value={companyForm.pincode}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        pincode: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="website"
                                label="Website"
                                type="url"
                                placeholder="https://example.com"
                                value={companyForm.website}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        website: event.target.value,
                                    }))
                                }
                            />

                            <TextInput
                                id="industry"
                                label="Industry"
                                placeholder="e.g. Manufacturing"
                                value={companyForm.industry}
                                onChange={(event) =>
                                    setCompanyForm((form) => ({
                                        ...form,
                                        industry: event.target.value,
                                    }))
                                }
                            />

                            <div className="sm:col-span-2">
                                <TextInput
                                    id="company-size"
                                    label="Company size"
                                    placeholder="e.g. 6–25 employees"
                                    value={companyForm.company_size}
                                    onChange={(event) =>
                                        setCompanyForm((form) => ({
                                            ...form,
                                            company_size: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={updateStatus === "loading"}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-amber)] px-4 py-2.5 text-sm font-semibold text-amber-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {updateStatus === "loading" && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Save changes
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetCompanyForm();
                                        setEditingCompany(false);
                                    }}
                                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                            <DetailItem label="Company name">
                                {profile.tenant.name || "—"}
                            </DetailItem>

                            <DetailItem label="Industry">
                                {profile.tenant.industry || "—"}
                            </DetailItem>

                            <DetailItem label="GST number">
                                {profile.tenant.gst_number || "—"}
                            </DetailItem>

                            <DetailItem label="PAN number">
                                {profile.tenant.pan_number || "—"}
                            </DetailItem>

                            <DetailItem label="Address" className="sm:col-span-2">
                                {address ? (
                                    <span className="flex items-start gap-1.5">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span>{address}</span>
                                    </span>
                                ) : (
                                    "—"
                                )}
                            </DetailItem>

                            <DetailItem label="Website">
                                {websiteUrl ? (
                                    <a
                                        href={websiteUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex max-w-full items-center gap-1.5 break-all text-foreground underline underline-offset-4 hover:text-muted-foreground"
                                    >
                                        {profile.tenant.website}
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    </a>
                                ) : (
                                    "—"
                                )}
                            </DetailItem>

                            <DetailItem label="Company size">
                                {profile.tenant.company_size || "—"}
                            </DetailItem>
                        </dl>
                    )}
                </section>

                <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </span>

                        <div>
                            <h2 className="font-semibold text-red-600">Danger zone</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Deleting your account is permanent and cannot be undone.
                            </p>

                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(true)}
                                className="mt-4 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10"
                            >
                                Delete account
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {deleteModalOpen && (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
                    onMouseDown={closeDeleteModal}
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-float)]"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
                            aria-label="Close delete account dialog"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </span>

                        <h3 id="delete-account-title" className="mt-4 text-lg font-bold">
                            Delete your account?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This action permanently deletes your account. Type{" "}
                            <strong className="break-all text-foreground">{profile.user.email}</strong>{" "}
                            to confirm.
                        </p>

                        <label htmlFor="confirm-delete-email" className="mt-5 grid gap-1.5">
                            <span className={labelClass}>Confirmation email</span>
                            <input
                                id="confirm-delete-email"
                                autoFocus
                                autoComplete="off"
                                value={confirmEmail}
                                onChange={(event) => setConfirmEmail(event.target.value)}
                                placeholder={profile.user.email}
                                className={inputClass}
                            />
                        </label>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={
                                    deleteStatus === "loading" ||
                                    confirmEmail.trim().toLowerCase() !==
                                    profile.user.email.toLowerCase()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleteStatus === "loading" && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Permanently delete account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}