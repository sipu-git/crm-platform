import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarCollapsed } from "@/features/ui/slice";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  BarChart3, Users, Kanban, FileText, Bell, Settings, ChevronsLeft,
  ChevronsRight, LogOut, Menu, Moon, Sun,
  Laptop, Check, ContactRound, ListTodo, ShieldCheck, Building2,
  Users2, FolderKanban, ReceiptText, UserRound,
  Building, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NotificationBell } from "./Header/NotificationBell";
import { usePermission } from "@/hooks/use-permission";
import { HeaderSearch } from "./Header/DebouceSearch";
import MemberBadges from "./Header/MemberBadges";
import { ThemeMenu } from "./Header/ThemeMenu";
import { UserMenu } from "./Header/UserMenu";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";

// `resource: null` means always visible — no permission gate (dashboard, notifications, settings)
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "dashboard", label: "Dashboard", icon: BarChart3, resource: null },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "leads", label: "Leads", icon: Users, resource: "leads" },
      { to: "enquires", label: "Enquiries", icon: Users, resource: "enquires" },
      { to: "contacts", label: "Contacts", icon: ContactRound, resource: "contacts" },
      { to: "companies", label: "Companies", icon: Building2, resource: "company" },
      { to: "deals", label: "Deals", icon: Kanban, resource: "deals" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "activities", label: "Activities", icon: ListTodo, resource: "activities" },
      { to: "calendar", label: "Calendar", icon: Calendar, resource: null },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Invoices", icon: FileText, resource: "invoices" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "notifications", label: "Notifications", icon: Bell, resource: null },
      { to: "teams", label: "Teams", icon: Users2, resource: "users" },
      { to: "audit", label: "Audit trail", icon: ShieldCheck, resource: "audit" },
      { to: "settings", label: "Settings", icon: Settings, resource: null },
    ],
  },
];

// Clients use the same shell and UI primitives, but their workspace is a
// delivery portal rather than an internal CRM. Keeping this separate makes it
// difficult to accidentally expose administrative navigation to a client.
const CLIENT_NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "dashboard", label: "Workspace", icon: BarChart3, resource: null }],
  },
  {
    label: "My account",
    items: [
      { to: "company-detail", label: "Company Profile", icon: Building, resource: "company" },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Billing", icon: ReceiptText, resource: "invoices" },
      { to: "profile", label: "Profile", icon: UserRound, resource: null },
    ],
  },
  {
    label: "Updates",
    items: [{ to: "notifications", label: "Notifications", icon: Bell, resource: null }],
  },
];

function NavList({ slug, collapsed, onNavigate }: {
  slug: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const { canSeeModule } = usePermission();
  const auth = useAuthPayload()
  const role = auth?.user.role;
  const groups = role === "CLIENT" ? CLIENT_NAV_GROUPS : NAV_GROUPS;

  return (
    <nav className="flex-1 space-y-4 px-2">
      {groups.map((group) => {
        const visibleItems = group.items.filter((n) => n.resource === null || canSeeModule(n.resource),);
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {visibleItems.map((n) => {
                const to = `/${slug}/${n.to}`;
                const active = pathname === to || pathname.startsWith(to + "/");
                const Icon = n.icon;
                const label = role === "SALES_REP" && n.to === "leads" ? "My assigned leads" : role === "SALES_REP" && n.to === "activities"
                  ? "My activities"
                  : n.label;
                return (
                  <Link
                    key={n.to}
                    to={to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent-foreground dark:hover:bg-warning-foreground hover:text-sidebar-primary-foreground",
                      collapsed && "justify-center px-2",
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed, name }: { collapsed: boolean; name: string }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-4 border-b mb-6 border-sidebar-border", collapsed && "justify-center px-2")}>
      <img src="/favicon.ico" alt="Clearview CRM" className="h-8 w-8" />
      {/* <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
        C
      </div> */}
      {!collapsed && (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Clearview CRM</div>
          <div className="truncate text-xs text-sidebar-foreground/60">{name}</div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ tenantSlug }: { tenantSlug: string }) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const { data: authResult } = useAuth();
  const role = authResult?.user?.role;
  const userRole = role === "CLIENT";
  const [mobileOpen, setMobileOpen] = useState(false);

  // useUsers({ enabled: !userRole });

  return (
    <div className="flex h-screen w-full overflow-hidden [background:var(--app-bg)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border text-sidebar-foreground transition-[width] duration-200 md:flex",
          "[background:var(--sidebar)]",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <Brand collapsed={collapsed} name={tenantSlug} />
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <NavList slug={tenantSlug} collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="mr-2 h-4 w-4" /> Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main column — fixed viewport, no scrolling here */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-4 border-b border-sidebar-border 
        [background:var(--sidebar)] text-sidebar-foreground">
          {/* Left: Mobile Menu + Members Badge */}
          <div className="flex items-center gap-2 justify-start">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-sidebar-border p-0 text-sidebar-foreground [background:var(--sidebar)]"
              >
                <Brand collapsed={false} name={tenantSlug} />
                <NavList slug={tenantSlug} collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="">
              {userRole ? (
                <div className="hidden" />
              ) : (
                <MemberBadges />
              )}
            </div>
          </div>

          {/* Center: Search component */}
          <div className="flex items-center justify-center w-full mx-auto">
            <div className="lg:w-lg max-w-4xl">
              <HeaderSearch />
            </div>
          </div>

          {/* Right: Notifications, Theme, User Menu */}
          <div className="flex items-center gap-3 justify-end">
            <NotificationBell tenantSlug={tenantSlug} />
            <ThemeMenu />
            <UserMenu />
          </div>
        </header>

        {/* Fixed viewport for the routed page — the page itself owns its scroll area */}
        <main className="min-h-0 flex-1 overflow-hidden [background:var(--background)]">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}