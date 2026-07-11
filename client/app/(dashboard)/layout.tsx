import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// NOTE on migration: the original app protected authenticated routes with a
// client-side <ProtectedRoute> component wrapping <AppShell> inside a
// react-router <Routes> tree. Next.js route groups let us do this natively:
// every route nested under `(dashboard)` runs this layout first, on the
// server, before any page code executes — so unauthenticated users never
// receive the page HTML at all (rather than flashing it and redirecting
// client-side). `middleware.ts` provides a second, edge-level layer of the
// same check for defense in depth.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session_token");

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
