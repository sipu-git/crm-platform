import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WidgetScope } from "@/features/dashboard/types/dashboard.types";
import type { HomeActivityItem } from "@/features/home/types";
import { RecentActivityWidget } from "@/features/home/components/widgets/RecentActivityWidget";

interface RecentActivitySectionProps {
  tenantSlug: string;
  activities: HomeActivityItem[];
  isLoading: boolean;
  scope: WidgetScope;
}

function RecentActivitySection({
  tenantSlug,
  activities,
  isLoading,
  scope,
}: RecentActivitySectionProps) {
  return (
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
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground">
          <Link to={`/${tenantSlug}/activities`}>
            View activities <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <RecentActivityWidget activities={activities} isLoading={isLoading} scope={scope} />
    </section>
  );
}

export default memo(RecentActivitySection);
