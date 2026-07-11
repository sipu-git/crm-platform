import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("crm.auth.token");
      const slug = localStorage.getItem("crm.tenant.slug") || "acme";
      if (token) throw redirect({ to: `/${slug}/dashboard` });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);
  const [email, setEmail] = useState("demo@crm.app");
  const [password, setPassword] = useState("demo");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) {
      const slug = res.payload.tenants[0]?.slug ?? "acme";
      dispatch(setCurrentTenant(slug));
      toast.success(`Welcome, ${res.payload.user.name}`);
      nav({ to: `/${slug}/dashboard` });
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-white/15 font-bold">C</div>
            <span className="text-lg font-semibold">Clearview CRM</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              Every conversation, every deal, every invoice — in one workspace.
            </h2>
            <p className="max-w-md text-primary-foreground/80">
              Multi-tenant CRM built for revenue teams. Track pipeline, close faster, get paid on time.
            </p>
          </div>
          <div className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Clearview
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Use the demo credentials to explore.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Demo credentials</div>
            <div>Email: <code>demo@crm.app</code></div>
            <div>Password: <code>demo</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}
