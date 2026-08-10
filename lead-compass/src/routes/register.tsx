import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/features/auth/slice";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RegisterFormValues, registerSchema, Role, validate } from "@/lib/validations/auth.validation";

const EMPTY_FORM: RegisterFormValues = {
  full_name: "",
  company_name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const registerStatus = useAppSelector((s) => s.auth.registerStatus);
  const apiError = useAppSelector((s) => s.auth.registerError);

  const [form, setForm] = useState<RegisterFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  function handleChange<K extends keyof RegisterFormValues>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = validate(registerSchema, form);
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});

    const { confirmPassword: _confirmPassword, ...payload } = result.data;
    const res = await dispatch(registerUser({ ...payload, role: Role.ADMIN }));

    if (registerUser.fulfilled.match(res)) {
      toast.success("Account created — sign in to continue");
      nav("/login");
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up your workspace in a minute.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            type="text"
            placeholder="Jane Doe"
            value={form.full_name}
            onChange={handleChange("full_name")}
          />
          {fieldErrors.full_name && <p className="text-sm text-destructive">{fieldErrors.full_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company name</Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Acme Inc."
            value={form.company_name}
            onChange={handleChange("company_name")}
          />
          {fieldErrors.company_name && (
            <p className="text-sm text-destructive">{fieldErrors.company_name}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={registerStatus === "loading"}>
          {registerStatus === "loading" ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}