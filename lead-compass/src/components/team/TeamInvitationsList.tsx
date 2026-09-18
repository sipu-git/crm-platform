import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {Mail,Phone,RotateCcw,Trash2,Pencil,Clock,Loader2,SendHorizonal,InboxIcon} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,
  AlertDialogFooter,AlertDialogHeader,AlertDialogTitle} from "@/components/ui/alert-dialog";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
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
} from "@/components/team/TeamStyles";
import { inviteUserSchema } from "@/features/users/validation";

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeDate(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}


type EditDialogProps = {
  invite: Invite | null;
  onOpenChange: (open: boolean) => void;
};

function EditInviteDialog({ invite, onOpenChange }: EditDialogProps) {
  const { invite: inviteMutation } = useUserMutations();
  const open = !!invite;

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    role: "SALES_REP" as Role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form whenever the selected invite changes
  useEffect(() => {
    if (invite) {
      setForm({
        full_name: invite.full_name ?? "",
        email: invite.email,
        mobile: invite.mobile ?? "",
        role: invite.role,
      });
      setErrors({});
      inviteMutation.reset();
    }
  }, [invite?.id]);

  useEffect(() => {
    if (inviteMutation.isSuccess) {
      toast.success("Invitation updated & resent");
      onOpenChange(false);
    }
    if (inviteMutation.isError) {
      toast.error(inviteMutation.error?.message ?? "Failed to update invitation");
    }
  }, [inviteMutation.isSuccess, inviteMutation.isError]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    inviteMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit invitation</DialogTitle>
          <DialogDescription>
            Update the invitation details. A new invite email will be sent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">Full name</Label>
            <Input
              id="edit_full_name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_mobile">Mobile</Label>
            <Input
              id="edit_mobile"
              placeholder="1234567890"
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            />
            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(role) => handleChange("role", role)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.filter((r) => r !== "CLIENT").map((r) => (
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

// ─── Skeleton Card ──────────────────────────────────────────────────────────

function InvitationCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ─── Single Invitation Card ─────────────────────────────────────────────────

type CardProps = {
  invite: Invite;
  onEdit: (invite: Invite) => void;
  onResend: (inviteId: string) => void;
  onRevoke: (invite: Invite) => void;
  resendingId: string | null;
};

function InvitationCard({ invite, onEdit, onResend, onRevoke, resendingId }: CardProps) {
  const displayName = invite.full_name?.trim() || invite.email.split("@")[0];
  const avatarCls = avatarStyle(displayName);
  const ringCls = ROLE_RING[invite.role] ?? DEFAULT_ROLE_RING;
  const isResending = resendingId === invite.id;

  return (
    <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Amber top stripe to signal pending */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400/60 via-amber-500/40 to-transparent" />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <Avatar className={`h-10 w-10 shrink-0 ring-2 ring-offset-2 ring-offset-card ${ringCls}`}>
            <AvatarFallback className={`text-xs font-semibold ${avatarCls}`}>
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>

          {/* Name + contact */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug truncate">{displayName}</p>
            <div className="mt-1 space-y-0.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {invite.email}
              </span>
              {invite.mobile && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {invite.mobile}
                </span>
              )}
            </div>
          </div>

          {/* Role badge */}
          <RoleBadge role={invite.role} />
        </div>

        {/* Footer row – meta + actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Invited date */}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            Invited {relativeDate(invite.createdAt)}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Edit */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs hover:bg-muted"
              onClick={() => onEdit(invite)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>

            {/* Resend */}
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

            {/* Revoke */}
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
}

// ─── Main Component ─────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SCROLL_THROTTLE_MS = 300;

export function TeamInvitationsList() {
  const { data: allInvites = [], isLoading } = useInvites();
  const { resendInvite, revokeInvite } = useUserMutations();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editTarget, setEditTarget] = useState<Invite | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invite | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // ── Infinite scroll with throttle ────────────────────────────────────────
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allInvites.length));
  }, [allInvites.length]);

  const throttledLoadMore = useCallback(() => {
    if (throttleTimer.current) return;
    throttleTimer.current = setTimeout(() => {
      loadMore();
      throttleTimer.current = null;
    }, SCROLL_THROTTLE_MS);
  }, [loadMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < allInvites.length) {
          throttledLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
    };
  }, [throttledLoadMore, visibleCount, allInvites.length]);

  // Reset visible count when data refreshes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [allInvites.length]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleResend = (inviteId: string) => {
    setResendingId(inviteId);
    resendInvite.mutate(inviteId, {
      onSuccess: () => {
        toast.success("Invitation resent successfully");
        setResendingId(null);
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to resend invitation");
        setResendingId(null);
      },
    });
  };

  const handleRevokeConfirm = () => {
    if (!revokeTarget) return;
    revokeInvite.mutate(revokeTarget.id, {
      onSuccess: () => {
        toast.success(`Invitation to ${revokeTarget.email} revoked`);
        setRevokeTarget(null);
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to revoke invitation");
        setRevokeTarget(null);
      },
    });
  };

  const visibleInvites = allInvites.slice(0, visibleCount);
  const hasMore = visibleCount < allInvites.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-3 w-3" />
            </span>
            Pending Invitations
          </h3>
          {!isLoading && allInvites.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 ml-7">
              {allInvites.length} invite{allInvites.length !== 1 ? "s" : ""} awaiting response
            </p>
          )}
        </div>
      </div>

      {/* Skeleton state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <InvitationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allInvites.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-12 text-center">
          <InboxIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No pending invitations</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Invitations you send will appear here until accepted.
          </p>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && visibleInvites.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleInvites.map((invite) => (
            <InvitationCard
              key={invite.id}
              invite={invite}
              onEdit={setEditTarget}
              onResend={handleResend}
              onRevoke={setRevokeTarget}
              resendingId={resendingId}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {hasMore && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more…
          </span>
        )}
      </div>

      {/* Edit dialog */}
      <EditInviteDialog
        invite={editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
      />

      {/* Revoke confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
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

