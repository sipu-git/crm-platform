import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUnreadNotifications,
  markRead,
  notificationsSelectors,
  selectUnreadCount,
} from "@/features/notifications/slice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell({ tenantSlug }: { tenantSlug: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = useAppSelector(notificationsSelectors.selectAll);
  const unreadCount = useAppSelector(selectUnreadCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchUnreadNotifications());
    intervalRef.current = setInterval(() => {
      dispatch(fetchUnreadNotifications());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [dispatch]);

  const recent = items.slice(0, 8);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        {recent.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
        {recent.length > 0 && (
          <div className="max-h-80 divide-y overflow-y-auto">
            {recent.map((n) => (
              <button
                key={n.id}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/40"
                onClick={() => {
                  if (!n.isRead) dispatch(markRead({ tenantSlug, id: n.id }));
                  setOpen(false);
                }}
              >
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.isRead ? "bg-muted-foreground/30" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{n.subject}</div>
                  <div className="truncate text-xs text-muted-foreground">{n.message}</div>
                </div>
                <div className="shrink-0 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setOpen(false);
              navigate(`/${tenantSlug}/notifications`);
            }}
          >
            View all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}