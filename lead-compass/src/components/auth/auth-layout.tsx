import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
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
          <div className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} Clearview</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}