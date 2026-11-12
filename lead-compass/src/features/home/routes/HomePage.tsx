import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Users } from "lucide-react";
import type { Deal } from "@/features/deals/deal.types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUsers";
import { usePermission } from "@/features/auth/hooks/use-permission";
import { normalizeRole } from "@/features/dashboard/configs/dashboard.config";
import type { WidgetScope } from "@/features/dashboard/types/dashboard.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import { useDeals } from "@/features/deals/hooks/useDeals";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import { communicationApis } from "@/features/communications/communication.service";
import type { GmailAccountStatus } from "@/features/communications/communication.types";
import HomeHeader, { type HomePrimaryAction } from "@/features/home/components/HomeHeader";
import { DeferredChunk } from "@/features/home/components/DeferredWidget";
import {countUnreadEmails,createHomeFavoriteItems,emailPayload,makeRecentRecords} from "@/features/home/home.utils";
import { toast } from "sonner";

const QuickActionsSection = lazy(() =>
  import("@/features/home/components/widgets/QuickActionsSection").then((module) => ({
    default: module.QuickActionsSection,
  })),
);

const HomeGrid = lazy(() => import("@/features/home/components/HomeGrid"));

const RecentActivitySection = lazy(
  () => import("@/features/home/components/RecentActivitySection"),
);

const EMPTY_DEALS: Deal[] = [];
const EMPTY_INVOICES: Invoice[] = [];

const AddLeadDialog = lazy(() =>
  import("@/features/leads/components/AddLeadDialog").then((module) => ({
    default: module.AddLeadDialog,
  })),
);

const InvoiceCreateDialog = lazy(() =>
  import("@/features/invoices/components/InvoiceCreateDialog").then((module) => ({
    default: module.InvoiceCreateDialog,
  })),
);

function HomePage() {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const activeRole = normalizeRole(currentUser.user?.role);
  const { canSeeModule } = usePermission();
  const [isLeadDialogOpen, setLeadDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isHomeWidgetsNearViewport, setHomeWidgetsNearViewport] = useState(false);
  const onHomeWidgetsVisible = useCallback(() => setHomeWidgetsNearViewport(true), []);

  const canSeeLeads = canSeeModule("leads");
  const canSeeDeals = canSeeModule("deals");
  const canSeeInvoices = canSeeModule("invoices");
  const canSeeActivities = canSeeModule("activities");
  const canSeeContacts = canSeeModule("contacts");
  const canSeeCompanies = canSeeModule("company");
  const canSeeProjects = canSeeModule("projects");
  const canSeeCommunications = canSeeModule("communications");

  const {
    tasks,
    activities,
    leads,
    isLoading: homeLoading,
  } = useHomeData(activeRole, {
    tasksEnabled: isHomeWidgetsNearViewport && canSeeActivities,
    recentEnabled:
      isHomeWidgetsNearViewport &&
      (canSeeActivities || canSeeLeads || canSeeDeals || canSeeInvoices),
  });
  const dealsQuery = useDeals(undefined, {
    enabled: isHomeWidgetsNearViewport && canSeeDeals,
  });
  const invoicesQuery = useInvoices(undefined, {
    enabled: isHomeWidgetsNearViewport && canSeeInvoices,
  });

  const gmailStatusQuery = useQuery({
    queryKey: ["communications", "gmail-status"],
    queryFn: async () =>
      emailPayload(await communicationApis.getGmailStatus()) as GmailAccountStatus,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: isHomeWidgetsNearViewport && canSeeCommunications,
  });
  const gmailConnected = Boolean(gmailStatusQuery.data?.connected);
  const gmailInboxQuery = useQuery({
    queryKey: ["communications", "gmail-inbox", "home"],
    queryFn: async () => emailPayload(await communicationApis.getGmailInbox(20)),
    enabled: isHomeWidgetsNearViewport && gmailConnected,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const deals = dealsQuery.data ?? EMPTY_DEALS;
  const allInvoices = invoicesQuery.data ?? EMPTY_INVOICES;
  const recentRecords = useMemo(
    () => makeRecentRecords(tenantSlug, leads, deals, allInvoices),
    [tenantSlug, leads, deals, allInvoices],
  );
  const unreadEmails = useMemo(
    () => countUnreadEmails(gmailInboxQuery.data),
    [gmailInboxQuery.data],
  );

  const favoriteItems = useMemo(
    () =>
      createHomeFavoriteItems(tenantSlug, {
        leads: canSeeLeads,
        deals: canSeeDeals,
        invoices: canSeeInvoices,
        activities: canSeeActivities,
        contacts: canSeeContacts,
        company: canSeeCompanies,
        projects: canSeeProjects,
      }),
    [
      tenantSlug,
      canSeeLeads,
      canSeeDeals,
      canSeeInvoices,
      canSeeActivities,
      canSeeContacts,
      canSeeCompanies,
      canSeeProjects,
    ],
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
    queryClient.invalidateQueries({ queryKey: ["deals"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["calendar"] });
    queryClient.invalidateQueries({ queryKey: ["communications", "gmail-inbox"] });
  }, [queryClient]);

  const openLeadDialog = useCallback(() => setLeadDialogOpen(true), []);
  const openInvoiceDialog = useCallback(() => setInvoiceDialogOpen(true), []);
  const handleConnectGmail = useCallback(async () => {
    try {
      const returnTo = `/${tenantSlug}/home`;
      const response = await communicationApis.getGmailConnectUrl(returnTo);
      const url = response.data?.data?.url ?? response.data?.url;
      if (!url) throw new Error("No Gmail authorization URL returned");
      window.location.href = url;
    } catch {
      toast.error("Could not start Gmail connection. Please try again.");
    }
  }, [tenantSlug]);

  const primaryAction = useMemo<HomePrimaryAction | null>(() => {
    if (canSeeLeads) return { label: "New lead", icon: Users, onClick: openLeadDialog };
    if (canSeeInvoices) {
      return { label: "Create invoice", icon: FileText, onClick: openInvoiceDialog };
    }
    return null;
  }, [canSeeLeads, canSeeInvoices, openLeadDialog, openInvoiceDialog]);

  const name = currentUser.user?.name || "Team member";
  const isRefreshing =
    homeLoading || dealsQuery.isFetching || invoicesQuery.isFetching || gmailInboxQuery.isFetching;
  const isLoadingRecords = homeLoading || dealsQuery.isLoading || invoicesQuery.isLoading;
  const activityScope: WidgetScope =
    activeRole === "SALES_REP" ? "own" : activeRole === "MANAGER" ? "team" : "org";

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

        <Suspense
          fallback={<div className="min-h-[190px] animate-pulse rounded-xl border bg-card/60" />}
        >
          <QuickActionsSection
            tenantSlug={tenantSlug}
            canCreateLead={canSeeLeads}
            canManageDeals={canSeeDeals}
            canManageInvoices={canSeeInvoices}
            canManageActivities={canSeeActivities}
            canManageContacts={canSeeContacts}
            canManageCompanies={canSeeCompanies}
            canManageProjects={canSeeProjects}
            onNewLead={openLeadDialog}
            onNewInvoice={openInvoiceDialog}
          />
        </Suspense>

        <DeferredChunk minHeight={700} onVisible={onHomeWidgetsVisible}>
          <HomeGrid
            tenantSlug={tenantSlug}
            tasks={tasks}
            deals={deals}
            invoices={allInvoices}
            unreadEmails={unreadEmails}
            gmailConnected={gmailConnected}
            isLoading={isLoadingRecords}
            showEmail={canSeeCommunications}
            recentRecords={recentRecords}
            favoriteItems={favoriteItems}
            onConnectGmail={handleConnectGmail}
            showTasks={canSeeActivities}
            showDeals={canSeeDeals}
            showInvoices={canSeeInvoices}
          />
        </DeferredChunk>

        {canSeeActivities && (
          <DeferredChunk minHeight={300} onVisible={onHomeWidgetsVisible}>
            <RecentActivitySection
              tenantSlug={tenantSlug}
              activities={activities}
              isLoading={homeLoading}
              scope={activityScope}
            />
          </DeferredChunk>
        )}
      </div>

      {isLeadDialogOpen && (
        <Suspense fallback={null}>
          <AddLeadDialog open={isLeadDialogOpen} onOpenChange={setLeadDialogOpen} />
        </Suspense>
      )}
      {canSeeInvoices && isInvoiceDialogOpen && (
        <Suspense fallback={null}>
          <InvoiceCreateDialog open={isInvoiceDialogOpen} onOpenChange={setInvoiceDialogOpen} />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;
