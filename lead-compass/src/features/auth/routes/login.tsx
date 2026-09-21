import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, Building2 } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { LoginFormValues, loginSchema, validate } from "@/features/auth/validations/auth.validation";

const EMPTY_FORM: LoginFormValues = { email: "", password: "" };

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // React‑Query login mutation
  const { mutateAsync: loginAsync, isPending, isError, error } = useLogin();

  const [form, setForm] = useState<LoginFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  function handleChange<K extends keyof LoginFormValues>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = validate(loginSchema, form);
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});

    // Clear any stale cache from a previous session
    queryClient.clear();

    try {
      const res = await loginAsync(result.data);
      toast.success(`Welcome, ${res.user.name}`);
      navigate(`/${res.user.tenantId}/dashboard`);
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Enter your credentials to access your workspace.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange("email")}
          />
          {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange("password")}
              className="pr-10"
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
          {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
        </div>

        {isError && error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {typeof error === "string" ? error : "Login error"}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        {/* Wrapped Create New Workspace Banner */}
        <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-indigo-900/30 to-purple-950/40 p-4 text-center shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
            <Building2 className="h-4 w-4 text-indigo-400" /> Setting up a new organization?
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Register your company and start your 14-day free trial.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all gap-1.5 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Create New Workspace →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}