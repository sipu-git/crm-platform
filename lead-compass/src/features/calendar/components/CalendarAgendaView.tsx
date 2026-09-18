import type { CalendarEvent } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-kit";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

export function CalendarAgendaView({
  events,
  onSelectEvent,
  onDeleteEvent,
}: CalendarAgendaViewProps) {
  if (!events.length) {
    return (
      <EmptyState
        title="No upcoming events"
        description="No events found for the selected period. Click 'Add Event' to schedule a meeting."
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => {
        const startIso = ev.start?.dateTime || ev.start?.date;
        const endIso = ev.end?.dateTime || ev.end?.date;

        let dateFormatted = "Upcoming";
        let timeRange = "All day";

        if (startIso) {
          try {
            const startDate = parseISO(startIso);
            dateFormatted = format(startDate, "EEEE, MMMM d, yyyy");

            if (ev.start?.dateTime) {
              const startTime = format(startDate, "p");
              const endTime = endIso ? format(parseISO(endIso), "p") : "";
              timeRange = endTime ? `${startTime} - ${endTime}` : startTime;
            }
          } catch {
            // fallback
          }
        }

        const hasMeet = Boolean(ev.hangoutLink);

        return (
          <Card key={ev.id} className="transition-shadow hover:shadow-md border-muted">
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    {dateFormatted}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {timeRange}
                  </Badge>
                  {hasMeet && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 gap-1 text-xs">
                      <Video className="h-3 w-3 text-blue-600 dark:text-blue-400" /> Google Meet
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-semibold tracking-tight text-foreground truncate">
                  {ev.summary}
                </h3>

                {ev.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ev.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {ev.location}
                    </span>
                  )}
                  {ev.attendees && ev.attendees.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {ev.attendees.length} {ev.attendees.length === 1 ? "attendee" : "attendees"}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions & Meet Link */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                {ev.hangoutLink && (
                  <a
                    href={ev.hangoutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Google Meet
                  </a>
                )}
                {ev.htmlLink && !ev.hangoutLink && (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View on Google
                  </a>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSelectEvent(ev)}
                  title="Edit event"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDeleteEvent(ev)}
                  title="Delete event"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

