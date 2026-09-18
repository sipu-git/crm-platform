import { useEffect, useState } from "react";
import type { CalendarEvent, CreateCalendarEventInput } from "../types";
import { useCalendarMutations } from "../hooks/useCalendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Video, Calendar, Clock, MapPin, AlignLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { format, addHours, parseISO } from "date-fns";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: CalendarEvent | null;
  initialDate?: Date | null;
}

export function EventDialog({
  open,
  onOpenChange,
  eventToEdit,
  initialDate,
}: EventDialogProps) {
  const { createEvent, updateEvent } = useCalendarMutations();

  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [attendeesInput, setAttendeesInput] = useState("");
  const [createMeetLink, setCreateMeetLink] = useState(true);

  useEffect(() => {
    if (!open) return;

    if (eventToEdit) {
      setSummary(eventToEdit.summary || "");
      setDescription(eventToEdit.description || "");
      setLocation(eventToEdit.location || "");

      const startIso = eventToEdit.start?.dateTime;
      const endIso = eventToEdit.end?.dateTime;

      if (startIso) {
        setStartDateTime(format(parseISO(startIso), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setStartDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      }

      if (endIso) {
        setEndDateTime(format(parseISO(endIso), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setEndDateTime(format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"));
      }

      if (eventToEdit.attendees) {
        setAttendeesInput(eventToEdit.attendees.map((a) => a.email).join(", "));
      } else {
        setAttendeesInput("");
      }

      setCreateMeetLink(Boolean(eventToEdit.hangoutLink));
    } else {
      // New Event
      const baseDate = initialDate || new Date();
      const startDateStr = format(baseDate, "yyyy-MM-dd'T'10:00");
      const endDateStr = format(baseDate, "yyyy-MM-dd'T'11:00");

      setSummary("");
      setDescription("");
      setLocation("");
      setStartDateTime(startDateStr);
      setEndDateTime(endDateStr);
      setAttendeesInput("");
      setCreateMeetLink(true);
    }
  }, [open, eventToEdit, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (!startDateTime || !endDateTime) {
      toast.error("Start and end times are required");
      return;
    }

    const startIso = new Date(startDateTime).toISOString();
    const endIso = new Date(endDateTime).toISOString();

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      toast.error("End time must be after start time");
      return;
    }

    const attendees = attendeesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes("@"));

    const payload: CreateCalendarEventInput = {
      summary: summary.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startDateTime: startIso,
      endDateTime: endIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      attendees: attendees.length ? attendees : undefined,
      createMeetLink,
    };

    try {
      if (eventToEdit) {
        await updateEvent.mutateAsync({ id: eventToEdit.id, value: payload });
        toast.success("Calendar event updated!");
      } else {
        await createEvent.mutateAsync(payload);
        toast.success("Calendar event created!");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save calendar event.");
    }
  };

  const isSubmitting = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {eventToEdit ? "Edit Calendar Event" : "Schedule New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="summary" className="text-xs font-semibold">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="summary"
              placeholder="e.g. Sales Discovery Call with Client"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          {/* Date Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDateTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Start Time
              </Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDateTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> End Time
              </Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Google Meet Link Switch */}
          <div className="flex items-center justify-between rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/50">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <Label htmlFor="createMeet" className="text-xs font-semibold cursor-pointer">
                  Add Google Meet Video Link
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Automatically generates a video conference URL for attendees.
                </p>
              </div>
            </div>
            <Switch
              id="createMeet"
              checked={createMeetLink}
              onCheckedChange={setCreateMeetLink}
            />
          </div>

          {/* Attendees */}
          <div className="space-y-1.5">
            <Label htmlFor="attendees" className="text-xs font-semibold flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" /> Attendees (comma separated emails)
            </Label>
            <Input
              id="attendees"
              placeholder="client@company.com, sales@ourcrm.com"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location (optional)
            </Label>
            <Input
              id="location"
              placeholder="Office / Meeting Room / Online"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold flex items-center gap-1">
              <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" /> Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Agenda items, notes, or meeting objectives..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : eventToEdit
                ? "Update Event"
                : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

