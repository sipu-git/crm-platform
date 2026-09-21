import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mail, Phone, User, ShieldCheck, Building2, Loader2, EyeOff, Eye } from "lucide-react";
import { ROLE_LABELS } from "@/features/users/components/TeamStyles";

interface InviteDetails {
  email: string;
  full_name?: string | null;
  mobile?: string | null;
  role: string;
  tenant_name: string;
  expires_at: string;
}

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  // Fetch invitation details using the token
  const {
    data: inviteDetails,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invite-details", token],
    queryFn: async () => {
      const res = await api.get(`/users/invite-details?token=${encodeURIComponent(token)}`);
      return res.data.data as InviteDetails;
    },
    enabled: Boolean(token),
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () =>
      api.post("/users/accept-invite", {
        token,
        password: form.password,
      }),
    onSuccess: () => {
      toast.success("Invitation accepted! You can now sign in.");
      navigate("/login", { replace: true });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to accept invitation.");
    },
  });

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return toast.error("This invitation link is incomplete.");
    if (form.password.length < 8) return toast.error("Use a password with at least 8 characters.");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    accept.mutate();
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Invitation" subtitle="This invitation link is missing a valid token.">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center">
          Please check the link sent to your email or request a new invitation.
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout title="Accept invitation" subtitle="Loading your invitation details…">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </AuthLayout>
    );
  }

  if (isError || !inviteDetails) {
    return (
      <AuthLayout title="Invitation Expired" subtitle="This invitation link is no longer active.">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center space-y-2">
          <p>{error instanceof Error ? error.message : "This invitation is invalid, expired, or has already been used."}</p>
          <p className="text-xs text-muted-foreground">Ask your workspace administrator to resend an invitation.</p>
        </div>
      </AuthLayout>
    );
  }

  const displayName = inviteDetails.full_name?.trim() || inviteDetails.email.split("@")[0];
  const roleLabel = ROLE_LABELS[inviteDetails.role] ?? inviteDetails.role;

  return (
    <AuthLayout title="Accept invitation" subtitle={`Join ${inviteDetails.tenant_name} on ClearView.`}>
      {/* Read-Only Pre-filled Invitation Details Card */}
      <div className="rounded-xl border bg-card/60 p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span>{inviteDetails.tenant_name} Workspace</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block">Full Name</span>
            <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {displayName}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Assigned Role</span>
            <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {roleLabel}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-muted-foreground block">Email Address</span>
            <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {inviteDetails.email}
            </span>
          </div>

          {inviteDetails.mobile && (
            <div className="col-span-2">
              <span className="text-muted-foreground block">Mobile Number</span>
              <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {inviteDetails.mobile}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Password Setup Form */}
      <form onSubmit={submit} className="space-y-4 pt-2">
        <Field label="Set account password">
          <div className="relative">
            <Input
              required
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Confirm password">
          <div className="relative">
            <Input
              required
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setConfirmShowPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {accept.isError && (
          <p className="text-sm text-destructive">
            Failed to accept invitation. Please try again or contact your admin.
          </p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={accept.isPending}>
          {accept.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Accept & create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
