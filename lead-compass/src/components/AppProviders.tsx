import { useEffect, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, tenantReset } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { configureApi } from "@/api/client";
import { logout } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    configureApi({
      getAuthToken: () => token,
      getTenantId: () => null,
      onUnauthorized: () => {
        dispatch(logout());
        navigate("/login");
      },
    });
  }, [token, dispatch, navigate]);
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
