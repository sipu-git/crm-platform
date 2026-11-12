import type { CalendarEvent } from "../types";
import { useCalendarMutations } from "../hooks/useCalendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apiError";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToDelete: CalendarEvent | null;
}

export default function DeleteEventDialog({
  open,
  onOpenChange,
  eventToDelete,
}: DeleteEventDialogProps) {
  const { deleteEvent } = useCalendarMutations();

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent.mutateAsync(eventToDelete.id);
      toast.success("Calendar event deleted");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Calendar Event?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{eventToDelete?.summary}&quot; from the workspace
            calendar? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEvent.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteEvent.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteEvent.isPending ? "Deleting..." : "Delete Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
