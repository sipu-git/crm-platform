import { useEffect, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, tenantReset } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { configureApi } from "@/api/client";
import { logout } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "@tanstack/react-router";

function ThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);
  useEffect(() => {
    const apply = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply();
    if (theme === "system") {
      const m = window.matchMedia("(prefers-color-scheme: dark)");
      m.addEventListener("change", apply);
      return () => m.removeEventListener("change", apply);
    }
  }, [theme]);
  return null;
}

function ApiConfigurator() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const tenantSlug = useAppSelector((s) => s.tenant.currentSlug);
  const tenants = useAppSelector((s) => s.auth.tenants);

  useEffect(() => {
    const tid = tenants.find((t) => t.slug === tenantSlug)?.id ?? null;
    configureApi({
      getAuthToken: () => token,
      getTenantId: () => tid,
      onUnauthorized: () => {
        dispatch(logout());
        router.navigate({ to: "/login" });
      },
    });
  }, [token, tenantSlug, tenants, dispatch, router]);
  return null;
}

export function TenantSwitchHelper({
  onSwitch,
}: {
  onSwitch?: (slug: string) => void;
}) {
  return null;
}

export function switchTenant(slug: string) {
  store.dispatch(tenantReset());
  store.dispatch(setCurrentTenant(slug));
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync />
      <ApiConfigurator />
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
