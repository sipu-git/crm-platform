import { useState, type Dispatch, type SetStateAction } from "react";
import { Loader2, ShieldAlert, X } from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground";

const labelClass = "text-xs font-medium text-muted-foreground";

interface DeleteAccountModalProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    userEmail: string;
    isPending: boolean;
    onConfirm: (confirmEmail: string) => Promise<void> | void;
}

export function DeleteAccountModal({
    open,
    onOpenChange,
    userEmail,
    isPending,
    onConfirm,
}: DeleteAccountModalProps) {
    const [confirmEmail, setConfirmEmail] = useState("");

    if (!open) return null;

    const close = () => {
        onOpenChange(false);
        setConfirmEmail("");
    };

    const handleConfirm = async () => {
        await onConfirm(confirmEmail.trim());
        setConfirmEmail("");
    };

    const canDelete =
        !isPending && confirmEmail.trim().toLowerCase() === userEmail.toLowerCase();

    return (
        <div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
            onMouseDown={close}
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
                    onClick={close}
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
                    <strong className="break-all text-foreground">{userEmail}</strong>{" "}
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
                        placeholder={userEmail}
                        className={inputClass}
                    />
                </label>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canDelete}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Permanently delete account
                    </button>
                </div>
            </div>
        </div>
    );
}