import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ContactRound,
  FileText,
  FolderKanban,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "@/components/Header/DebouceSearch";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUsers";
import { usePermission } from "@/features/auth/hooks/use-permission";
import { normalizeRole, ROLE_LABELS } from "@/features/dashboard/configs/dashboard.config";
import type {
  DashboardRole,
  TaskItem,
  WidgetScope,
} from "@/features/dashboard/types/dashboard.types";
import type { Deal } from "@/features/deals/deal.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import { useDeals } from "@/features/deals/hooks/useDeals";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { InvoiceCreateDialog } from "@/features/invoices/components/InvoiceCreateDialog";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import { AddLeadDialog } from "@/features/leads/components/AddLeadDialog";
import { communicationApis } from "@/features/communications/communication.service";
import type { GmailAccountStatus } from "@/features/communications/communication.types";
import {
  AttentionWidget,
  CRMAssistantWidget,
  ContinueWidget,
  FavoritesWidget,
  QuickActionsSection,
  RecentActivityWidget,
  type HomeFavorite,
  type RecentRecord,
} from "@/features/home/components/HomeWidgets";
import { toast } from "sonner";
import type { HomeLeadRecord } from "@/features/home/types";

const CalendarUpcomingWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/CalendarUpcomingWidget").then((module) => ({
    default: module.CalendarUpcomingWidget,
  })),
);

interface VisitedRecord {
  href: string;
  kind: "lead" | "deal" | "invoice";
  id: string;
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

function emailPayload(response: unknown): unknown {
  const envelope = asRecord(response);
  const body = asRecord(envelope?.data);
  return body?.data ?? envelope?.data ?? response;
}

function countUnreadEmails(payload: unknown): number | null {
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

function makeRecentRecords(
  visited: VisitedRecord[],
  leads: HomeLeadRecord[],
  deals: Deal[],
  invoices: Invoice[],
): RecentRecord[] {
  return visited.slice(0, 5).map((visit) => {
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
      ? [names, lead.company_name].filter(Boolean).join(" · ") || "Lead record"
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

function HomeHeader({
  activeRole,
  userName,
  onRefresh,
  isRefreshing,
  primaryAction,
}: {
  activeRole: DashboardRole;
  userName: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  primaryAction: { label: string; icon: LucideIcon; onClick: () => void } | null;
}) {
  const currentMeta = ROLE_LABELS[activeRole];
  const firstName = userName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const RoleIcon =
    activeRole === "ADMIN"
      ? ShieldCheck
      : activeRole === "MANAGER"
        ? Users
        : activeRole === "FINANCE"
          ? FileText
          : BriefcaseBusiness;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.09] via-card to-card px-5 py-5 shadow-sm sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <RoleIcon className="h-3.5 w-3.5" /> {currentMeta.badge}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Here’s what’s happening across your workspace. Pick up where you left off or get a head
            start on today’s work.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-background/80"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />{" "}
            Refresh
          </Button>
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              <primaryAction.icon className="mr-2 h-4 w-4" /> {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function HomeSearch() {
  return (
    <section aria-label="Global CRM search" className="relative z-20">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Find a lead, deal, contact, or invoice
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-2 shadow-sm sm:p-2.5">
        <HeaderSearch className="max-w-none" />
      </div>
    </section>
  );
}

function dispatchAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent("crm:open-ai", { detail: { prompt } }));
}

function HomeGrid({
  tenantSlug,
  tasks,
  deals,
  invoices,
  unreadEmails,
  gmailConnected,
  isLoading,
  recentRecords,
  favoriteItems,
  onConnectGmail,
  showTasks,
  showDeals,
  showInvoices,
}: {
  tenantSlug: string;
  tasks: TaskItem[];
  deals: Deal[];
  invoices: Invoice[];
  unreadEmails: number | null;
  gmailConnected: boolean;
  isLoading: boolean;
  recentRecords: RecentRecord[];
  favoriteItems: HomeFavorite[];
  onConnectGmail: () => void;
  showTasks: boolean;
  showDeals: boolean;
  showInvoices: boolean;
}) {
  return (
    <section aria-labelledby="home-grid-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 id="home-grid-title" className="text-sm font-semibold">
            Your workspace
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">A practical view of what’s next.</p>
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <CalendarDays className="h-3.5 w-3.5" /> {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <AttentionWidget
            tasks={tasks}
            deals={deals}
            invoices={invoices}
            unreadEmails={unreadEmails}
            isLoading={isLoading}
            gmailConnected={gmailConnected}
            onConnectGmail={onConnectGmail}
            showTasks={showTasks}
            showDeals={showDeals}
            showInvoices={showInvoices}
          />
        </div>
        <div className="xl:col-span-5">
          <Suspense
            fallback={<div className="min-h-[350px] animate-pulse rounded-xl border bg-card/60" />}
          >
            <CalendarUpcomingWidget title="Today" todayOnly />
          </Suspense>
        </div>
        <div className="xl:col-span-4">
          <FavoritesWidget key={tenantSlug} tenantSlug={tenantSlug} items={favoriteItems} />
        </div>
        <div className="xl:col-span-4">
          <CRMAssistantWidget onOpen={dispatchAssistant} />
        </div>
        <div className="xl:col-span-4">
          <ContinueWidget records={recentRecords} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const activeRole = normalizeRole(currentUser.user?.role);
  const { canSeeModule } = usePermission();
  const [isLeadDialogOpen, setLeadDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const { tasks, activities, leads, isLoading: homeLoading } = useHomeData(activeRole);
  const dealsQuery = useDeals();
  const invoicesQuery = useInvoices();

  const gmailStatusQuery = useQuery({
    queryKey: ["communications", "gmail-status"],
    queryFn: async () =>
      emailPayload(await communicationApis.getGmailStatus()) as GmailAccountStatus,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const gmailConnected = Boolean(gmailStatusQuery.data?.connected);
  const gmailInboxQuery = useQuery({
    queryKey: ["communications", "gmail-inbox", "home"],
    queryFn: async () => emailPayload(await communicationApis.getGmailInbox(20)),
    enabled: gmailConnected,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
  const allInvoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const recentRecords = useMemo(
    () => makeRecentRecords(readVisitedRecords(tenantSlug), leads, deals, allInvoices),
    [tenantSlug, leads, deals, allInvoices],
  );

  const favoriteItems = useMemo(() => {
    const modules: Array<HomeFavorite & { resource: string | null }> = [
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
    return modules.filter((item) => item.resource === null || canSeeModule(item.resource));
  }, [tenantSlug, canSeeModule]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
    queryClient.invalidateQueries({ queryKey: ["deals"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["calendar"] });
    queryClient.invalidateQueries({ queryKey: ["communications", "gmail-inbox"] });
  }, [queryClient]);

  const handleConnectGmail = async () => {
    try {
      const returnTo = `/${tenantSlug}/home`;
      const response = await communicationApis.getGmailConnectUrl(returnTo);
      const url = response.data?.data?.url ?? response.data?.url;
      if (!url) throw new Error("No Gmail authorization URL returned");
      window.location.href = url;
    } catch {
      toast.error("Could not start Gmail connection. Please try again.");
    }
  };

  const name = currentUser.user?.name || "Team member";
  const isRefreshing =
    homeLoading || dealsQuery.isFetching || invoicesQuery.isFetching || gmailInboxQuery.isFetching;
  const isLoadingRecords = homeLoading || dealsQuery.isLoading || invoicesQuery.isLoading;
  const activityScope: WidgetScope =
    activeRole === "SALES_REP" ? "own" : activeRole === "MANAGER" ? "team" : "org";
  const canSeeActivities = canSeeModule("activities");
  const primaryAction = canSeeModule("leads")
    ? { label: "New lead", icon: Users, onClick: () => setLeadDialogOpen(true) }
    : canSeeModule("invoices")
      ? { label: "Create invoice", icon: FileText, onClick: () => setInvoiceDialogOpen(true) }
      : null;

  return (
    <div className="min-h-full bg-muted/20">
      <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <HomeHeader
          activeRole={activeRole}
          userName={name}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          primaryAction={primaryAction}
        />

        <HomeSearch />

        <QuickActionsSection
          tenantSlug={tenantSlug}
          deals={deals}
          canCreateLead={canSeeModule("leads")}
          canManageDeals={canSeeModule("deals")}
          canManageInvoices={canSeeModule("invoices")}
          canManageActivities={canSeeModule("activities")}
          canManageContacts={canSeeModule("contacts")}
          canManageCompanies={canSeeModule("company")}
          canManageProjects={canSeeModule("projects")}
          onNewLead={() => setLeadDialogOpen(true)}
          onNewInvoice={() => setInvoiceDialogOpen(true)}
        />

        <HomeGrid
          tenantSlug={tenantSlug}
          tasks={tasks}
          deals={deals}
          invoices={allInvoices}
          unreadEmails={countUnreadEmails(gmailInboxQuery.data)}
          gmailConnected={gmailConnected}
          isLoading={
            homeLoading || dealsQuery.isLoading || invoicesQuery.isLoading || isLoadingRecords
          }
          recentRecords={recentRecords}
          favoriteItems={favoriteItems}
          onConnectGmail={handleConnectGmail}
          showTasks={canSeeActivities}
          showDeals={canSeeModule("deals")}
          showInvoices={canSeeModule("invoices")}
        />

        {canSeeActivities && (
          <section aria-labelledby="recent-activity-title">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 id="recent-activity-title" className="text-sm font-semibold">
                  Recent activity
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  The latest updates across your CRM.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 text-xs text-muted-foreground"
              >
                <Link to={`/${tenantSlug}/activities`}>
                  View activities <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <RecentActivityWidget
              activities={activities}
              isLoading={homeLoading}
              scope={activityScope}
            />
          </section>
        )}
      </div>

      <AddLeadDialog open={isLeadDialogOpen} onOpenChange={setLeadDialogOpen} />
      {canSeeModule("invoices") && (
        <InvoiceCreateDialog open={isInvoiceDialogOpen} onOpenChange={setInvoiceDialogOpen} />
      )}
    </div>
  );
}
