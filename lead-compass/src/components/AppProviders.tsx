import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store, tenantReset } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { configureApi } from "@/api/client";
import { setCurrentTenant } from "@/features/tenant/slice";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { PushNotificationManager } from "@/features/notifications/PushNotificationManager";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";

function ThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);
  useEffect(() => {
    const apply = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
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

const getCurrentToken = () => {
  // Directly read token from localStorage; avoid using React hooks here
  return typeof window !== "undefined" ? localStorage.getItem("crm.auth.token") : null;
};

function ApiConfigurator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    configureApi({
      getAuthToken: getCurrentToken,
      getTenantId: () => null,
      onUnauthorized: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("crm.auth.token");
          localStorage.removeItem("crm.auth.refresh_token");
          localStorage.removeItem("crm.tenant.slug");
        }
        queryClient.clear();
        navigate("/login");
      },
      onForbidden: (message, from) => {
        navigate("/403", { replace: true, state: { message, from } });
      },
      onTokenRefreshed: (newToken, user, permissions) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("crm.auth.token", newToken);
        }
        // keep the React‑Query auth cache in sync
        if (user && permissions) {
          queryClient.setQueryData(["auth", "me"], {
            accessToken: newToken,
            user,
            permissions,
          });
        }
      },
    });
  }, [navigate, queryClient]);
  return null;
}

function PushNotifications() {
  return <PushNotificationManager authenticated={Boolean(getCurrentToken())} />;
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
      <PushNotifications />
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
