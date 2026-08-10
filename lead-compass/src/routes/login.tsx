import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/features/auth/slice";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoginFormValues, loginSchema, validate } from "@/lib/validations/auth.validation";

const EMPTY_FORM: LoginFormValues = { email: "", password: "" };

export function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const status = useAppSelector((s) => s.auth.status);
  const apiError = useAppSelector((s) => s.auth.error);

  const [form, setForm] = useState<LoginFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

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

    const res = await dispatch(login(result.data));
    if (login.fulfilled.match(res)) {
      toast.success(`Welcome, ${res.payload.user.name}`);
      nav(`/${res.payload.user.tenantId}/dashboard`);
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
          />
          {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
        </div>

        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}