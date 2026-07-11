import { useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markAllRead,
  markRead,
  notificationsSelectors,
} from "@/features/notifications/slice";
import { formatDistanceToNow } from "date-fns";

export function NotificationsBell({ tenantSlug }: { tenantSlug: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(notificationsSelectors.selectAll);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    dispatch(fetchNotifications(tenantSlug));
  }, [dispatch, tenantSlug]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">Notifications</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => dispatch(markAllRead(tenantSlug))}
          >
            <Check className="mr-1 h-3 w-3" />
            Mark all read
          </Button>
        </div>
        <div className="max-h-96 overflow-auto">
          {items.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              className="flex w-full items-start gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted"
              onClick={() =>
                !n.read && dispatch(markRead({ tenantSlug, id: n.id }))
              }
            >
              <div
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.read ? "bg-muted-foreground/40" : "bg-primary"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{n.title}</div>
                <div className="truncate text-xs text-muted-foreground">{n.body}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
