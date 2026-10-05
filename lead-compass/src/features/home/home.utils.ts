import type { Deal } from "@/features/deals/deal.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { HomeLeadRecord } from "@/features/home/types";
import type { RecentRecord } from "@/features/home/components/widgets/types";
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ContactRound,
  FileText,
  FolderKanban,
  Users,
  UserRound,
} from "lucide-react";
import type { HomeFavorite } from "@/features/home/components/widgets/types";

interface VisitedRecord {
  href: string;
  kind: "lead" | "deal" | "invoice";
  id: string;
}

export interface HomeModuleVisibility {
  leads: boolean;
  deals: boolean;
  contacts: boolean;
  activities: boolean;
  invoices: boolean;
  projects: boolean;
  company: boolean;
}

export function createHomeFavoriteItems(
  tenantSlug: string,
  visible: HomeModuleVisibility,
): HomeFavorite[] {
  const modules: Array<HomeFavorite & { resource: keyof HomeModuleVisibility | null }> = [
    {
      id: "leads",
      label: "Leads",
      href: `/${tenantSlug}/leads`,
      icon: Users,
      tone: "bg-sky-500/10 text-sky-600",
      resource: "leads",
    },
    {
      id: "deals",
      label: "Deals",
      href: `/${tenantSlug}/deals`,
      icon: BriefcaseBusiness,
      tone: "bg-violet-500/10 text-violet-600",
      resource: "deals",
    },
    {
      id: "contacts",
      label: "Contacts",
      href: `/${tenantSlug}/contacts`,
      icon: ContactRound,
      tone: "bg-teal-500/10 text-teal-600",
      resource: "contacts",
    },
    {
      id: "calendar",
      label: "Calendar",
      href: `/${tenantSlug}/calendar`,
      icon: CalendarDays,
      tone: "bg-amber-500/10 text-amber-600",
      resource: null,
    },
    {
      id: "activities",
      label: "Activities",
      href: `/${tenantSlug}/activities`,
      icon: Activity,
      tone: "bg-emerald-500/10 text-emerald-600",
      resource: "activities",
    },
    {
      id: "invoices",
      label: "Invoices",
      href: `/${tenantSlug}/invoices`,
      icon: FileText,
      tone: "bg-rose-500/10 text-rose-600",
      resource: "invoices",
    },
    {
      id: "projects",
      label: "Projects",
      href: `/${tenantSlug}/projects`,
      icon: FolderKanban,
      tone: "bg-indigo-500/10 text-indigo-600",
      resource: "projects",
    },
    {
      id: "companies",
      label: "Companies",
      href: `/${tenantSlug}/companies`,
      icon: Building2,
      tone: "bg-blue-500/10 text-blue-600",
      resource: "company",
    },
    {
      id: "profile",
      label: "My profile",
      href: `/${tenantSlug}/profile`,
      icon: UserRound,
      tone: "bg-primary/10 text-primary",
      resource: null,
    },
  ];

  return modules
    .filter((item) => item.resource === null || visible[item.resource])
    .map(({ resource: _resource, ...item }) => item);
}

function readVisitedRecords(tenantSlug: string): VisitedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(`crm.home.recent.${tenantSlug}`) || "[]");
  } catch {
    return [];
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

export function emailPayload(response: unknown): unknown {
  const envelope = asRecord(response);
  const body = asRecord(envelope?.data);
  return body?.data ?? envelope?.data ?? response;
}

export function countUnreadEmails(payload: unknown): number | null {
  const root = asRecord(payload);
  if (typeof root?.unreadCount === "number") return root.unreadCount;
  const candidates = [root?.messages, root?.emails, root?.items, root?.data];
  const emails: unknown[] = Array.isArray(payload)
    ? payload
    : ((candidates.find((candidate) => Array.isArray(candidate)) as unknown[] | undefined) ?? []);
  if (!Array.isArray(emails)) return null;
  return emails.filter((email) => {
    const message = asRecord(email);
    const labelIds = message?.labelIds;
    const labels = message?.labels;
    return (
      message?.isRead === false ||
      message?.unread === true ||
      message?.status === "RECEIVED" ||
      (Array.isArray(labelIds) && labelIds.includes("UNREAD")) ||
      (Array.isArray(labels) && labels.includes("UNREAD"))
    );
  }).length;
}

export function makeRecentRecords(
  tenantSlug: string,
  leads: HomeLeadRecord[],
  deals: Deal[],
  invoices: Invoice[],
): RecentRecord[] {
  return readVisitedRecords(tenantSlug)
    .slice(0, 5)
    .map((visit) => {
      const lead = visit.kind === "lead" ? leads.find((item) => item.id === visit.id) : undefined;
      const deal = visit.kind === "deal" ? deals.find((item) => item.id === visit.id) : undefined;
      const invoice =
        visit.kind === "invoice" ? invoices.find((item) => item.id === visit.id) : undefined;
      const names = [lead?.contact?.first_name, lead?.contact?.last_name].filter(Boolean).join(" ");
      const label = lead
        ? lead.company_name || names || lead.project_name || "Lead"
        : deal
          ? deal.title
          : invoice
            ? invoice.invoice_number
            : `${visit.kind[0].toUpperCase()}${visit.kind.slice(1)} #${visit.id.slice(0, 7)}`;
      const subtitle = lead
        ? [names, lead.company_name].filter(Boolean).join(" \u00b7 ") || "Lead record"
        : deal
          ? deal.leads?.company_name || "Deal record"
          : invoice
            ? invoice.buyer_name || "Invoice record"
            : "Recently opened record";
      return {
        key: `${visit.kind}:${visit.id}`,
        label,
        subtitle,
        href: visit.href,
        kind: visit.kind,
      };
    });
}

export function dispatchAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent("crm:open-ai", { detail: { prompt } }));
}
