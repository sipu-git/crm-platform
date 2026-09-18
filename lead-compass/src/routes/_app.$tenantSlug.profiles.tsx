import {
    useState,
    type FormEvent,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    useProfile,
    useProfileMutation,
} from "@/features/profiles/hooks/useProfile";
import { toast } from "sonner";
import {
    Building2,
    ExternalLink,
    KeyRound,
    Loader2,
    Mail,
    MapPin,
    Pencil,
    ShieldAlert,
    User,
} from "lucide-react";
import type { UpdateProfilePayload } from "@/features/profiles/types";
import { DeleteAccountModal } from "@/components/profiles/DeleteAccountModal";
import { useAppSelector } from "@/store/hooks";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";

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
    children: ReactNode;
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
        const normalized = /^https?:\/\//i.test(value)
            ? value
            : `https://${value}`;

        const url = new URL(normalized);

        return ["http:", "https:"].includes(url.protocol)
            ? url.href
            : null;
    } catch {
        return null;
    }
}

function formDataToPayload<T>(form: HTMLFormElement): T {
    const entries = Array.from(new FormData(form).entries()).map(
        ([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : "",
        ],
    );

    return Object.fromEntries(entries) as T;
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const auth = useAuthPayload()
    const isClient = auth?.user.role==="CLIENT";
    const { data: profile, isLoading, isError } = useProfile();
    const { update: updateProfile, delete: deleteProfile } = useProfileMutation();
    const [editingPersonal, setEditingPersonal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    if (isError) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
                <p
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    Could not load your profile. Please refresh and try again.
                </p>
            </div>
        );
    }

    if (isLoading || !profile) {
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

    const address = [
        profile.tenant.address,
        profile.tenant.city,
        profile.tenant.state,
        profile.tenant.pincode,
        profile.tenant.country,
    ]
        .filter(Boolean)
        .join(", ");

    async function saveSection(
        event: FormEvent<HTMLFormElement>,
        successMessage: string,
        errorMessage: string,
        onDone: () => void,
    ) {
        event.preventDefault();

        const payload = formDataToPayload<UpdateProfilePayload>(
            event.currentTarget,
        );

        try {
            await updateProfile.mutateAsync(payload);
            toast.success(successMessage);
            onDone();
        } catch {
            toast.error(errorMessage);
        }
    }

    async function handleDeleteAccount(confirmEmail: string) {
        try {
            await deleteProfile.mutateAsync({
                confirm_email: confirmEmail,
            });

            toast.success("Account deleted");
            setDeleteModalOpen(false);
        } catch {
            toast.error("Could not delete account");
        }
    }

    return (
        <>
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
                                            <span className="truncate">
                                                {profile.tenant.name || "Workspace"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
                                    <User className="h-4 w-4 text-accent-foreground" />
                                </span>

                                <div>
                                    <h2 className="font-semibold">
                                        Personal information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Your account name and email address
                                    </p>
                                </div>
                            </div>

                            {!editingPersonal && (
                                <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/reset-password")}
                                        className="inline-flex bg-accent items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-accent/90"
                                    >
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Reset password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditingPersonal(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {editingPersonal ? (
                            <form
                                onSubmit={(event) =>
                                    saveSection(
                                        event,
                                        "Personal details updated",
                                        "Could not update your details",
                                        () => setEditingPersonal(false),
                                    )
                                }
                                className="mt-6 grid gap-4 sm:grid-cols-2"
                            >
                                <TextInput id="full-name" name="full_name" label="Full name"
                                    required autoComplete="name" defaultValue={profile.user.full_name}
                                />

                                <TextInput id="email" name="email" label="Email address"
                                    type="email" required autoComplete="email" defaultValue={profile.user.email}
                                />

                                <TextInput id="mobile" name="mobile" label="Mobile Number"
                                    type="text" required autoComplete="tel" defaultValue={profile.user.mobile}
                                />

                                <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={updateProfile.isPending}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-amber)] px-4 py-2.5 text-sm font-semibold text-amber-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {updateProfile.isPending && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        Save changes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditingPersonal(false)}
                                        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                <DetailItem label="Full name">
                                    {profile.user.full_name}
                                </DetailItem>

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

                    {isClient ? (
                        <div className="hidden" />
                    ) : (
                        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
                                        <Building2 className="h-4 w-4 text-accent-foreground" />
                                    </span>

                                    <div>
                                        <h2 className="font-semibold">
                                            Company details
                                        </h2>

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
                                <form
                                    onSubmit={(event) =>
                                        saveSection(
                                            event,
                                            "Company details updated",
                                            "Could not update company details",
                                            () => setEditingCompany(false),
                                        )
                                    }
                                    className="mt-6 grid gap-4 sm:grid-cols-2"
                                >
                                    <div className="sm:col-span-2">
                                        <TextInput id="company-name" name="name" label="Company name"
                                            required autoComplete="organization" defaultValue={profile.tenant.name}
                                        />
                                    </div>

                                    <TextInput id="gst-number" name="gst_number" label="GST number"
                                        placeholder="22AAAAA0000A1Z5" maxLength={15} defaultValue={profile.tenant.gst_number ?? ""} onChange={(event) => { event.target.value = event.target.value.toUpperCase(); }}
                                    />

                                    <TextInput id="pan-number" name="pan_number" label="PAN number"
                                        placeholder="ABCDE1234F" maxLength={10} defaultValue={profile.tenant.pan_number ?? ""} onChange={(event) => { event.target.value = event.target.value.toUpperCase(); }}
                                    />

                                    <div className="sm:col-span-2">
                                        <TextInput id="address" name="address" label="Address"
                                            autoComplete="street-address" defaultValue={profile.tenant.address ?? ""}
                                        />
                                    </div>

                                    <TextInput id="city" name="city" label="City"
                                        autoComplete="address-level2" defaultValue={profile.tenant.city ?? ""}
                                    />

                                    <TextInput id="state" name="state" label="State"
                                        autoComplete="address-level1" defaultValue={profile.tenant.state ?? ""}
                                    />

                                    <TextInput id="country" name="country" label="Country"
                                        autoComplete="country-name" defaultValue={profile.tenant.country ?? ""}
                                    />

                                    <TextInput id="pincode" name="pincode" label="Pincode"
                                        autoComplete="postal-code" defaultValue={profile.tenant.pincode ?? ""}
                                    />

                                    <TextInput id="website" name="website" label="Website"
                                        type="url" placeholder="https://example.com" defaultValue={profile.tenant.website ?? ""}
                                    />

                                    <TextInput id="industry" name="industry" label="Industry"
                                        placeholder="e.g. Manufacturing" defaultValue={profile.tenant.industry ?? ""}
                                    />

                                    <div className="sm:col-span-2">
                                        <TextInput id="company-size" name="company_size" label="Company size"
                                            placeholder="e.g. 6–25 employees" defaultValue={profile.tenant.company_size ?? ""}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-amber)] px-4 py-2.5 text-sm font-semibold text-amber-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {updateProfile.isPending && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            Save changes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setEditingCompany(false)}
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
                    )}

                    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10">
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                            </span>

                            <div>
                                <h2 className="font-semibold text-red-600">
                                    Danger zone
                                </h2>

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
            </div>

            <DeleteAccountModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                userEmail={profile.user.email}
                isPending={deleteProfile.isPending}
                onConfirm={handleDeleteAccount}
            />
        </>
    );
}