import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {deleteNotifications,fetchAllNotifications,markAllRead,markRead,notificationsSelectors} from "@/features/notifications/slice";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function NotificationsPage() {
  const { tenantSlug = "" } = useParams();
  const dispatch = useAppDispatch();
  const items = useAppSelector(notificationsSelectors.selectAll);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllNotifications());
  }, [dispatch, tenantSlug]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((n) => n.id)));
  };

  const handleDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setDeleting(true);
    try {
      await dispatch(deleteNotifications(ids)).unwrap();
      toast.success(`Deleted ${ids.length} notification${ids.length === 1 ? "" : "s"}`);
      setSelectMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete notifications");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Alerts, mentions and workspace activity."
        actions={
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <Button variant="ghost" size="sm" onClick={toggleSelectMode} disabled={deleting}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSelectAll} disabled={deleting}>
                  {allSelected ? "Deselect all" : "Select all"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={!someSelected || deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Deleting..." : `Delete${someSelected ? ` (${selectedIds.size})` : ""}`}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => dispatch(markAllRead())}>
                  <Check className="mr-2 h-4 w-4" /> Mark all as read
                </Button>
                {items.length > 0 && (
                  <Button variant="outline" size="sm" onClick={toggleSelectMode}>
                    Select
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />
      <div className="p-6">
        {items.length === 0 && <EmptyState title="No notifications" />}
        {items.length > 0 && (
          <div className="divide-y rounded-lg border bg-card">
            {items.map((n) => (
              <div
                key={n.id}
                className="flex w-full items-start gap-3 px-4 py-3 hover:bg-muted/40"
              >
                {selectMode && (
                  <Checkbox
                    checked={selectedIds.has(n.id)}
                    onCheckedChange={() => toggleOne(n.id)}
                    className="mt-1"
                  />
                )}
                <button
                  className="flex flex-1 items-start gap-3 text-left"
                  onClick={() => {
                    if (selectMode) toggleOne(n.id);
                    else if (!n.isRead) dispatch(markRead({ tenantSlug, id: n.id }));
                  }}
                >
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.isRead ? "bg-muted-foreground/30" : "bg-primary"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{n.subject}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}