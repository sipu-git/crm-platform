import { useState, useMemo, lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Plus, ArrowRight, VideoOff } from "lucide-react";
import { useCalendarEvents, useCalendarHolidays } from "@/features/calendar/hooks/useCalendar";
import { decorateGoogleHolidays } from "@/features/calendar/utils/festivals";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";

const EventDialog = lazy(() =>
  import("@/features/calendar/components/EventDialog").then((m) => ({
    default: m.EventDialog,
  }))
);

/**
 * Stable date key that only changes when the calendar day rolls over.
 * This prevents query key churn on every mount/remount within the same day.
 */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function CalendarUpcomingWidget({
  title = "Upcoming Meetings",
  todayOnly = false,
}: {
  title?: string;
  todayOnly?: boolean;
}) {
  const { tenantSlug = "acme" } = useParams();
  const [newEventOpen, setNewEventOpen] = useState(false);

  // Stable filters: only recompute when the actual calendar day changes,
  // NOT on every component remount. This prevents query key changes on navigation.
  const dayKey = useMemo(todayKey, []);
  const filters = useMemo(() => {
    const today = new Date();
    const start = startOfDay(today);
    const result: { timeMin: string; timeMax?: string } = {
      timeMin: start.toISOString(),
    };
    if (todayOnly) {
      result.timeMax = endOfDay(today).toISOString();
    }
    return result;
    // dayKey ensures we recompute only when the date actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayOnly, dayKey]);

  const {
    data: events = [],
    isLoading: eventsLoading,
    isFetching: eventsFetching,
  } = useCalendarEvents(filters, {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: rawHolidays = [],
    isLoading: holidaysLoading,
    isFetching: holidaysFetching,
  } = useCalendarHolidays(filters, {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const decoratedHolidays = useMemo(() => decorateGoogleHolidays(rawHolidays), [rawHolidays]);

  const upcomingEvents = useMemo(() => {
    const combined = [...events, ...decoratedHolidays];
    return combined.slice(0, 4);
  }, [events, decoratedHolidays]);

  // Only show skeleton on FIRST load (no cached data yet).
  // Subsequent background refetches show stale data with no skeleton.
  const isFirstLoad = eventsLoading || holidaysLoading;
  const isFetching = eventsFetching || holidaysFetching;

  if (isFirstLoad) {
    return (
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {upcomingEvents.length > 0 && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                  {upcomingEvents.length} Scheduled
                </Badge>
              )}
              {/* Subtle indicator when background-refreshing */}
              {isFetching && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" />
              )}
            </div>
            <CardDescription className="text-xs">
              {todayOnly ? "Your calendar for today" : "Synchronized Google Calendar meetings & video calls"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setNewEventOpen(true)}
              title="Schedule Meeting"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Full Calendar">
              <Link to={`/${tenantSlug}/calendar`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 p-0 px-6 pb-4 flex-1">
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-muted/60">
                <VideoOff className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-semibold text-foreground">No Upcoming meetings</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Your schedule is clear. Click below to schedule a call with clients.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewEventOpen(true)}
                className="mt-2 text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Schedule Event
              </Button>
            </div>
          ) : (
            upcomingEvents.map((ev) => {
              const startIso = ev.start?.dateTime || ev.start?.date;
              let dateFormatted = "Upcoming";
              let timeFormatted = "All day";

              if (startIso) {
                try {
                  const startDate = parseISO(startIso);
                  dateFormatted = format(startDate, "MMM d");
                  if (ev.start?.dateTime) {
                    timeFormatted = format(startDate, "p");
                  }
                } catch {
                  // ignore
                }
              }

              const hasMeet = Boolean(ev.hangoutLink);

              return (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate text-foreground">
                        {ev.summary}
                      </span>
                      {hasMeet && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[10px] shrink-0 gap-1 px-1.5 py-0">
                          <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" /> Meet
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        {dateFormatted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        {timeFormatted}
                      </span>
                    </div>
                  </div>

                  {ev.hangoutLink ? (
                    <a
                      href={ev.hangoutLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join
                    </a>
                  ) : (
                    <Button variant="ghost" size="sm" asChild className="text-xs h-8 shrink-0">
                      <Link to={`/${tenantSlug}/calendar`}>View</Link>
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {newEventOpen && (
        <Suspense fallback={null}>
          <EventDialog
            open={newEventOpen}
            onOpenChange={setNewEventOpen}
          />
        </Suspense>
      )}
    </>
  );
}
