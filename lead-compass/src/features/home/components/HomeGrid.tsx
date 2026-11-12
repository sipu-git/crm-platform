import { lazy, memo } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { TaskItem } from "@/features/dashboard/types/dashboard.types";
import type { Deal } from "@/features/deals/deal.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";
import type { HomeFavorite, RecentRecord } from "@/features/home/components/widgets/types";
import { dispatchAssistant } from "@/features/home/home.utils";
import { DeferredChunk } from "@/features/home/components/DeferredWidget";

const AttentionWidget = lazy(() =>
  import("@/features/home/components/widgets/AttentionWidget").then((module) => ({
    default: module.AttentionWidget,
  })),
);

const FavoritesWidget = lazy(() =>
  import("@/features/home/components/widgets/FavoritesWidget").then((module) => ({
    default: module.FavoritesWidget,
  })),
);

const CRMAssistantWidget = lazy(() =>
  import("@/features/home/components/widgets/CRMAssistantWidget").then((module) => ({
    default: module.CRMAssistantWidget,
  })),
);

const ContinueWidget = lazy(() =>
  import("@/features/home/components/widgets/ContinueWidget").then((module) => ({
    default: module.ContinueWidget,
  })),
);

const CalendarUpcomingWidget = lazy(() =>
  import("@/features/dashboard/components/widgets/CalendarUpcomingWidget").then((module) => ({
    default: module.CalendarUpcomingWidget,
  })),
);

interface HomeGridProps {
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
  showEmail: boolean;
  showTasks: boolean;
  showDeals: boolean;
  showInvoices: boolean;
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
  showEmail,
  showTasks,
  showDeals,
  showInvoices,
}: HomeGridProps) {
  return (
    <section aria-labelledby="home-grid-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 id="home-grid-title" className="text-sm font-semibold">
            Your workspace
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">A practical view of what's next.</p>
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <CalendarDays className="h-3.5 w-3.5" /> {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DeferredChunk minHeight={300}>
            <AttentionWidget
              tasks={tasks}
              deals={deals}
              invoices={invoices}
              unreadEmails={unreadEmails}
              isLoading={isLoading}
              gmailConnected={gmailConnected}
              onConnectGmail={onConnectGmail}
              showEmail={showEmail}
              showTasks={showTasks}
              showDeals={showDeals}
              showInvoices={showInvoices}
            />
          </DeferredChunk>
        </div>
        <div className="xl:col-span-5">
          <DeferredChunk minHeight={300}>
            {showTasks && <CalendarUpcomingWidget title="Today" todayOnly />}
          </DeferredChunk>
        </div>
        <div className="xl:col-span-4">
          <DeferredChunk minHeight={230}>
            <FavoritesWidget key={tenantSlug} tenantSlug={tenantSlug} items={favoriteItems} />
          </DeferredChunk>
        </div>
        <div className="xl:col-span-4">
          <DeferredChunk minHeight={230}>
            <CRMAssistantWidget onOpen={dispatchAssistant} />
          </DeferredChunk>
        </div>
        <div className="xl:col-span-4">
          <DeferredChunk minHeight={230}>
            <ContinueWidget records={recentRecords} isLoading={isLoading} />
          </DeferredChunk>
        </div>
      </div>
    </section>
  );
}

export default memo(HomeGrid);
