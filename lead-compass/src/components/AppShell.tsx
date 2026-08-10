import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarCollapsed } from "@/features/ui/slice";
import { switchTenant } from "@/components/AppProviders";
import { logout } from "@/features/auth/slice";
import {BarChart3,Users,Kanban,FileText,Bell,Settings,ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Moon,
  Sun,
  Laptop,
  Check,
  Search,
  ContactRound,
  ListTodo,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
// import { NotificationsBell } from "@/components/NotificationsBell";
import { cn } from "@/lib/utils";
import { setTheme, type ThemeMode } from "@/features/ui/slice";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "dashboard", label: "Dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "leads", label: "Leads", icon: Users },
      { to: "contacts", label: "Contacts", icon: ContactRound },
      { to: "companies", label: "Companies", icon: Building2 },
      { to: "deals", label: "Deals", icon: Kanban },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "activities", label: "Activities", icon: ListTodo },
      { to: "invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "notifications", label: "Notifications", icon: Bell },
      { to: "audit", label: "Audit trail", icon: ShieldCheck },
      { to: "settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavList({
  slug,
  collapsed,
  onNavigate,
}: {
  slug: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <nav className="flex-1 space-y-4 px-2 py-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              {group.label}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((n) => {
              const to = `/${slug}/${n.to}`;
              const active = pathname === to || pathname.startsWith(to + "/");
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? n.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{n.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed, name }: { collapsed: boolean; name: string }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "justify-center px-2")}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
        C
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Clearview CRM</div>
          <div className="truncate text-xs text-muted-foreground">{name}</div>
        </div>
      )}
    </div>
  );
}

function ThemeMenu() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const opts: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {opts.map((o) => {
          const Icon = o.icon;
          return (
            <DropdownMenuItem key={o.value} onClick={() => dispatch(setTheme(o.value))}>
              <Icon className="mr-2 h-4 w-4" /> {o.label}
              {theme === o.value && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// function TenantSwitcher({ slug }: { slug: string }) {
//   return <Button variant="outline" size="sm" className="h-9 gap-2"><div className="h-4 w-4 rounded bg-primary" /><span className="max-w-35 truncate">{slug}</span></Button>;
// }

function UserMenu() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm md:inline">{user?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user?.name}</span>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            dispatch(logout());
            nav("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ tenantSlug }: { tenantSlug: string }) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full
    bg-[linear-gradient(45deg,#edf4fd,#eff3fd,#f1f2fc,#f2f0fc,#f4effc,#f6eefb,#f8edfb,#f9ebfa,#fbeafa)]
    dark:bg-[linear-gradient(45deg,#000000,#040204,#080408,#0c060b,#10080f,#130913,#170b17,#1b0d1a,#1f0f1e)]
    " >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <Brand collapsed={collapsed} name={tenantSlug} />
        <NavList slug={tenantSlug} collapsed={collapsed} />
        <div className="border-t p-2">
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

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Brand collapsed={false} name={tenantSlug} />
              <NavList slug={tenantSlug} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* <TenantSwitcher slug={tenantSlug} /> */}

          <div className="ml-2 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search leads, deals, invoices..." className="h-9 pl-9" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* <NotificationsBell tenantSlug={tenantSlug} /> */}
            <ThemeMenu />
            <UserMenu />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
