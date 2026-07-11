import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("crm.auth.token");
    const slug = localStorage.getItem("crm.tenant.slug") || "acme";
    if (token) {
      throw redirect({ to: `/${slug}/dashboard` });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
