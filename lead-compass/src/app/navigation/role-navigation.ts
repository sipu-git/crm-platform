import {BarChart3,Bell,Building,Building2,Calendar,ContactRound,FileText,
  FolderKanban,House,Kanban,ListTodo,ReceiptText,Settings,ShieldCheck,Users,
  Users2,UserRound,type LucideIcon} from "lucide-react";
import type { AppRole } from "@/lib/permissionContract";

export interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  resource?: string;
  roles?: readonly AppRole[];
}

export interface NavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}

const overview: NavigationGroup = {
  label: "Overview",
  items: [
    { to: "home", label: "Home", icon: House },
    { to: "dashboard", label: "Analytics dashboard", icon: BarChart3 },
  ],
};

const adminNavigation: readonly NavigationGroup[] = [
  overview,
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
      { to: "calendar", label: "Calendar", icon: Calendar, resource: "activities" },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Invoices", icon: FileText, resource: "invoices" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "notifications", label: "Notifications", icon: Bell, resource: "notifications" },
      { to: "teams", label: "Teams", icon: Users2, resource: "users" },
      { to: "audit", label: "Audit trail", icon: ShieldCheck, resource: "audit" },
      {
        to: "settings",
        label: "Settings",
        icon: Settings,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];

const managerNavigation: readonly NavigationGroup[] = [
  overview,
  {
    label: "Team pipeline",
    items: [
      { to: "leads", label: "Team leads", icon: Users, resource: "leads" },
      { to: "enquires", label: "Enquiries", icon: Users, resource: "enquires" },
      { to: "deals", label: "Deal pipeline", icon: Kanban, resource: "deals" },
      { to: "contacts", label: "Contacts", icon: ContactRound, resource: "contacts" },
      { to: "companies", label: "Companies", icon: Building2, resource: "company" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "activities", label: "Activities", icon: ListTodo, resource: "activities" },
      { to: "calendar", label: "Calendar", icon: Calendar, resource: "activities" },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Invoices", icon: FileText, resource: "invoices" },
    ],
  },
  {
    label: "Team",
    items: [
      { to: "notifications", label: "Notifications", icon: Bell, resource: "notifications" },
      { to: "teams", label: "Team members", icon: Users2, resource: "users" },
      { to: "audit", label: "Audit trail", icon: ShieldCheck, resource: "audit" },
    ],
  },
];

const salesNavigation: readonly NavigationGroup[] = [
  overview,
  {
    label: "My work",
    items: [
      { to: "leads", label: "My assigned leads", icon: Users, resource: "leads" },
      { to: "deals", label: "My deals", icon: Kanban, resource: "deals" },
      { to: "activities", label: "My activities", icon: ListTodo, resource: "activities" },
      { to: "calendar", label: "Calendar", icon: Calendar, resource: "activities" },
      { to: "enquires", label: "Enquiries", icon: Users, resource: "enquires" },
    ],
  },
  {
    label: "Customers",
    items: [
      { to: "contacts", label: "Contacts", icon: ContactRound, resource: "contacts" },
      { to: "companies", label: "Companies", icon: Building2, resource: "company" },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Invoices", icon: FileText, resource: "invoices" },
    ],
  },
  {
    label: "Updates",
    items: [{ to: "notifications", label: "Notifications", icon: Bell, resource: "notifications" }],
  },
];

const financeNavigation: readonly NavigationGroup[] = [
  overview,
  {
    label: "Finance",
    items: [
      { to: "invoices", label: "Invoices & billing", icon: ReceiptText, resource: "invoices" },
      { to: "deals", label: "Revenue deals", icon: Kanban, resource: "deals" },
      { to: "contacts", label: "Contacts", icon: ContactRound, resource: "contacts" },
      { to: "companies", label: "Companies", icon: Building2, resource: "company" },
    ],
  },
  {
    label: "Updates",
    items: [{ to: "notifications", label: "Notifications", icon: Bell, resource: "notifications" }],
  },
];

const clientNavigation: readonly NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ to: "home", label: "Workspace", icon: House }],
  },
  {
    label: "My account",
    items: [
      { to: "company-detail", label: "Company profile", icon: Building, resource: "company" },
      { to: "projects", label: "Projects", icon: FolderKanban, resource: "projects" },
      { to: "invoices", label: "Billing", icon: ReceiptText, resource: "invoices" },
      { to: "profile", label: "My profile", icon: UserRound },
    ],
  },
  {
    label: "Updates",
    items: [{ to: "notifications", label: "Notifications", icon: Bell, resource: "notifications" }],
  },
];

export const ROLE_NAVIGATION: Readonly<Record<AppRole, readonly NavigationGroup[]>> = {
  SUPER_ADMIN: adminNavigation,
  ADMIN: adminNavigation,
  MANAGER: managerNavigation,
  SALES_REP: salesNavigation,
  FINANCE: financeNavigation,
  CLIENT: clientNavigation,
};

export function getRoleNavigation(role: AppRole | undefined): readonly NavigationGroup[] {
  return role ? ROLE_NAVIGATION[role] : [];
}
