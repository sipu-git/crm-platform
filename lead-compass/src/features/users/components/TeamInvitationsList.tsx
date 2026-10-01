import React, { memo, useCallback, useEffect, useState } from "react";
import { Mail, Phone, Trash2, Pencil, Clock, Loader2, SendHorizonal, InboxIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvites, useUserMutations } from "@/features/users/hooks/useUsers";
import type { Invite, Role } from "@/features/users/types";
import { ROLE_OPTIONS } from "@/features/users/types";
import {
  RoleBadge,
  avatarStyle,
  initials,
  ROLE_RING,
  DEFAULT_ROLE_RING,
  ROLE_ICONS,
} from "@/features/users/components/TeamStyles";
import { inviteUserSchema } from "@/features/users/validation";
import { FormAlert, useFormAlert } from "@/components/ui/form-alert";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function relativeDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Edit dialog ────────────────────────────────────────────────────────────

type EditForm = { full_name: string; email: string; mobile: string; role: Role };

const EMPTY_FORM: EditForm = { full_name: "", email: "", mobile: "", role: "SALES_REP" };

type EditDialogProps = {
  invite: Invite | null;
  onOpenChange: (open: boolean) => void;
};

function EditInviteDialog({ invite, onOpenChange }: EditDialogProps) {
  const { invite: inviteMutation } = useUserMutations();
  const { alert, showSuccess, showError, dismiss } = useFormAlert();
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill whenever a different invite is selected
  useEffect(() => {
    if (!invite) return;
    setForm({
      full_name: invite.full_name ?? "",
      email: invite.email,
      mobile: invite.mobile ?? "",
      role: invite.role,
    });
    setErrors({});
    dismiss();
    inviteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite?.id]);

  // Close shortly after success, surface errors
  useEffect(() => {
    if (inviteMutation.isSuccess) {
      showSuccess("Invitation updated & resent");
      const t = setTimeout(() => onOpenChange(false), 1200);
      return () => clearTimeout(t);
    }
    if (inviteMutation.isError) {
      showError(inviteMutation.error?.message ?? "Failed to update invitation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteMutation.isSuccess, inviteMutation.isError]);

  const handleChange = (name: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
    dismiss();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dismiss();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    inviteMutation.mutate(form);
  };

  const textFields = [
    { name: "full_name", label: "Full name", placeholder: "John Doe", type: "text" },
    { name: "email", label: "Email", placeholder: "john@example.com", type: "email" },
    { name: "mobile", label: "Mobile", placeholder: "1234567890", type: "text" },
  ] as const;

  return (
    <Dialog open={!!invite} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit invitation</DialogTitle>
          <DialogDescription>
            Update the invitation details. A new invite email will be sent.
          </DialogDescription>
        </DialogHeader>
        <FormAlert alert={alert} onDismiss={dismiss} />
        <form onSubmit={handleSubmit} className="space-y-4">
          {textFields.map(({ name, label, placeholder, type }) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={`edit_${name}`}>{label}</Label>
              <Input
                id={`edit_${name}`}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={(e) => handleChange(name, e.target.value)}
              />
              {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
            </div>
          ))}

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(role) => handleChange("role", role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    <span className="flex items-center gap-2">
                      {ROLE_ICONS[r]}
                      {r}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & resend"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function InvitationCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ─── Invitation card (memoized) ─────────────────────────────────────────────

type CardProps = {
  invite: Invite;
  isResending: boolean;
  onEdit: (invite: Invite) => void;
  onResend: (inviteId: string) => void;
  onRevoke: (invite: Invite) => void;
};

const InvitationCard = memo(function InvitationCard({
  invite,
  isResending,
  onEdit,
  onResend,
  onRevoke,
}: CardProps) {
  const displayName = invite.full_name?.trim() || invite.email.split("@")[0];
  const ringCls = ROLE_RING[invite.role] ?? DEFAULT_ROLE_RING;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Amber stripe signals "pending" */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400/60 via-amber-500/40 to-transparent" />

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar className={`h-10 w-10 shrink-0 ring-2 ring-offset-2 ring-offset-card ${ringCls}`}>
            <AvatarFallback className={`text-xs font-semibold ${avatarStyle(displayName)}`}>
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-snug">{displayName}</p>
            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{invite.email}</span>
              </span>
              {invite.mobile && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {invite.mobile}
                </span>
              )}
            </div>
          </div>

          <RoleBadge role={invite.role} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            Invited {relativeDate(invite.createdAt)}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs hover:bg-muted"
              onClick={() => onEdit(invite)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={isResending}
              onClick={() => onResend(invite.id)}
            >
              {isResending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizonal className="h-3.5 w-3.5" />
              )}
              {isResending ? "Sending…" : "Resend"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRevoke(invite)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Revoke
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── List panel (lives inside the drawer) ───────────────────────────────────

const PAGE_SIZE = 10;

type PanelProps = {
  /** Tells the parent drawer whether a nested dialog is open, so outside-clicks don't close the drawer. */
  onModalChange: (open: boolean) => void;
};

function InvitationsPanel({ onModalChange }: PanelProps) {
  const { data: allInvites = [], isLoading } = useInvites();
  const { resendInvite, revokeInvite } = useUserMutations();
  const { alert, showSuccess, showError, dismiss } = useFormAlert();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editTarget, setEditTarget] = useState<Invite | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invite | null>(null);
  // State-based refs so the observer re-attaches once the elements mount
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const total = allInvites.length;
  const hasMore = visibleCount < total;

  // Report nested-dialog state to the drawer
  const modalOpen = !!editTarget || !!revokeTarget;
  useEffect(() => {
    onModalChange(modalOpen);
  }, [modalOpen, onModalChange]);
  useEffect(() => () => onModalChange(false), [onModalChange]);

  useEffect(() => {
    if (!scrollEl || !sentinelEl || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { root: scrollEl, rootMargin: "120px" }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [scrollEl, sentinelEl, hasMore, visibleCount]);

  // ── Handlers (stable so memoized cards don't re-render) ──
  const handleResend = useCallback(
    (inviteId: string) => {
      dismiss();
      resendInvite.mutate(inviteId, {
        onSuccess: () => showSuccess("Invitation resent successfully"),
        onError: (err: any) => showError(err?.message ?? "Failed to resend invitation"),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resendInvite.mutate]
  );

  const handleRevokeConfirm = () => {
    if (!revokeTarget) return;
    const { id, email } = revokeTarget;
    dismiss();
    revokeInvite.mutate(id, {
      onSuccess: () => showSuccess(`Invitation to ${email} revoked`),
      onError: (err: any) => showError(err?.message ?? "Failed to revoke invitation"),
      onSettled: () => setRevokeTarget(null),
    });
  };

  const resendingId = resendInvite.isPending ? (resendInvite.variables as string) : null;

  // NOTE: no nested <Drawer> here. The parent <Drawer> owns open state, so
  // <DrawerClose> below now closes the real drawer.
  return (
    <>
      <DrawerHeader className="space-y-1 border-b px-5 py-4 text-left">
        <div className="flex items-center justify-between">
          <DrawerTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-3 w-3" />
            </span>
            Pending invitations
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </div>
        <DrawerDescription>
          {isLoading
            ? "Loading…"
            : total > 0
              ? `${total} invite${total !== 1 ? "s" : ""} awaiting response`
              : "Nothing waiting on a response"}
        </DrawerDescription>
      </DrawerHeader>

      <div
        ref={setScrollEl}
        data-vaul-no-drag
        className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
      >
        <FormAlert alert={alert} onDismiss={dismiss} className="mb-4" />

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <InvitationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && total === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-12 text-center">
            <InboxIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No pending invitations</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Invitations you send will appear here until accepted.
            </p>
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="flex flex-col gap-3">
            {allInvites.slice(0, visibleCount).map((invite) => (
              <InvitationCard
                key={invite.id}
                invite={invite}
                isResending={resendingId === invite.id}
                onEdit={setEditTarget}
                onResend={handleResend}
                onRevoke={setRevokeTarget}
              />
            ))}
          </div>
        )}

        {/* Infinite-scroll sentinel */}
        <div ref={setSentinelEl} className="flex h-8 items-center justify-center">
          {hasMore && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more…
            </span>
          )}
        </div>
      </div>

      <EditInviteDialog
        invite={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />

      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && !revokeInvite.isPending && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke the invitation sent to{" "}
              <strong>{revokeTarget?.email}</strong>. They will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeInvite.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={revokeInvite.isPending}
              onClick={(e) => {
                e.preventDefault(); // keep dialog open to show the loading state
                handleRevokeConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeInvite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking…
                </>
              ) : (
                "Revoke"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Responsive drawer: right side on desktop, bottom sheet on mobile. The panel unmounts on close, so scroll/pagination state resets. */
export function TeamInvitationsDrawer({ open, onOpenChange }: DrawerProps) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);

  // Don't let clicks/Escape on the nested edit/revoke dialogs dismiss the drawer
  const guard = (e: Event) => {
    if (modalOpen) e.preventDefault();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        onInteractOutside={guard}
        onEscapeKeyDown={guard}
        className={
          isMobile
            ? "flex max-h-[90vh] flex-col gap-0 p-0"
            : "inset-y-0 right-0 left-auto mt-0 flex h-full w-[min(92vw,28rem)] flex-col gap-0 rounded-l-[10px] rounded-t-none border-l p-0"
        }
      >
        <InvitationsPanel onModalChange={setModalOpen} />
      </DrawerContent>
    </Drawer>
  );
}

/** Optional trigger button with a live pending count. */
export function PendingInvitesButton({ onClick }: { onClick: () => void }) {
  const { data = [] } = useInvites();
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={onClick}>
      <Clock className="h-4 w-4 text-amber-500" />
      Pending invites
      {data.length > 0 && (
        <span className="rounded-full bg-amber-500/15 px-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          {data.length}
        </span>
      )}
    </Button>
  );
}