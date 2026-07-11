import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchMe } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";

export const Route = createFileRoute("/_app/$tenantSlug")({
  ssr: false,
  component: TenantLayout,
});

function TenantLayout() {
  const { tenantSlug } = Route.useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentTenant(tenantSlug));
    dispatch(fetchMe());
  }, [dispatch, tenantSlug]);

  return <AppShell tenantSlug={tenantSlug} />;
}
