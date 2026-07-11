import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markAllRead,
  markRead,
  notificationsSelectors,
} from "@/features/notifications/slice";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/$tenantSlug/notifications")({
  ssr: false,
  component: NotificationsPage,
});

function NotificationsPage() {
  const { tenantSlug } = Route.useParams();
  const dispatch = useAppDispatch();
  const items = useAppSelector(notificationsSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchNotifications(tenantSlug));
  }, [dispatch, tenantSlug]);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Alerts, mentions and workspace activity."
        actions={
          <Button variant="outline" onClick={() => dispatch(markAllRead(tenantSlug))}>
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        }
      />
      <div className="p-6">
        {items.length === 0 && <EmptyState title="No notifications" />}
        {items.length > 0 && (
          <div className="divide-y rounded-lg border bg-card">
            {items.map((n) => (
              <button
                key={n.id}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40"
                onClick={() => !n.read && dispatch(markRead({ tenantSlug, id: n.id }))}
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
