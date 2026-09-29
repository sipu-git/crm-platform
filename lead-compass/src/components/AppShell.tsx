import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { usePermission } from "@/features/auth/hooks/use-permission";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { NotificationBell } from "./Header/NotificationBell";
import { HeaderSearch } from "./Header/DebouceSearch";
import { ThemeMenu } from "./Header/ThemeMenu";
import { UserMenu } from "./Header/UserMenu";
import { AICopilotModal } from "@/features/ai/components/AICopilotModal";
import { SynoraAiButton } from "./SynoraAiButton";
import { cn } from "@/lib/utils";
import {
  BarChart3, Users, Kanban, FileText, Bell, Settings,
  ContactRound, ListTodo, ShieldCheck, Building2,
  Users2, FolderKanban, ReceiptText, UserRound,
  Building, Calendar,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

const AppSidebar = React.memo(function AppSidebar({ slug }: { slug: string }) {
  const { pathname } = useLocation();
  const { canSeeModule } = usePermission();
  const auth = useAuthPayload();
  const role = auth?.user?.role;
  const groups = role === "CLIENT" ? CLIENT_NAV_GROUPS : NAV_GROUPS;

  const visibleGroups = React.useMemo(() => {
    return groups.map((group) => {
      const visibleItems = group.items.filter((n) => n.resource === null || canSeeModule(n.resource));
      return { ...group, items: visibleItems };
    }).filter(group => group.items.length > 0);
  }, [groups, canSeeModule]);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <img src="/favicon.ico" alt="Clearview CRM" className="h-7 w-7 object-contain" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold text-sidebar-foreground">Clearview CRM</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{slug}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((n) => {
                  const to = `/${slug}/${n.to}`;
                  const active = pathname === to || pathname.startsWith(to + "/");
                  const Icon = n.icon;
                  const label = role === "SALES_REP" && n.to === "leads" ? "My assigned leads" : role === "SALES_REP" && n.to === "activities"
                    ? "My activities"
                    : n.label;
                  return (
                    <SidebarMenuItem key={n.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={label}>
                        <Link to={to}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
});

export function AppShell({ tenantSlug }: { tenantSlug: string }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar slug={tenantSlug} />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 border-b border-sidebar-border [background:var(--sidebar)] text-sidebar-foreground">
          {/* Top row: trigger + (desktop search) + actions */}
          <div className="flex h-14 items-center justify-between gap-2 px-4">
            {/* Left: Sidebar trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <SidebarTrigger className="-ml-2" />
            </div>

            {/* Center: Search (desktop only) */}
            <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-auto px-4">
              <HeaderSearch />
            </div>

            {/* Right: Notifications, Theme, User Menu */}
            <div className="flex items-center gap-3 shrink-0">
              <NotificationBell tenantSlug={tenantSlug} />
              <ThemeMenu />
              <UserMenu />
            </div>
          </div>

          {/* Bottom row: Search (mobile only) */}
          <div className="md:hidden px-4 pb-3">
            <HeaderSearch />
          </div>

          {/* Floating AI button */}
          <SynoraAiButton onClick={() => setIsCopilotOpen(true)} className="fixed bottom-6 right-6 z-50 shadow-lg" />
        </header>

        {/* Fixed viewport for the routed page — the page itself owns its scroll area */}
        <main className="min-h-0 flex-1 overflow-hidden [background:var(--background)]">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
        <div className="bg-background">
          <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 py-2">
            © {new Date().getFullYear()} Lead Compass CRM. Multi-tenant Enterprise Platform. All rights reserved.
          </footer>
        </div>
        <AICopilotModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}