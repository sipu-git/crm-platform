import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("crm.auth.token");
    if (!token) throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
