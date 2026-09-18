import { useMemo } from "react";
import type { CalendarEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { Video, Clock } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay,
}: CalendarMonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Group events by day ISO string (yyyy-MM-dd)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (!event.start) continue;
      const dateStr = event.start.dateTime || event.start.date;
      if (!dateStr) continue;
      try {
        const dateObj = parseISO(dateStr);
        const key = format(dateObj, "yyyy-MM-dd");
        const list = map.get(key) || [];
        list.push(event);
        map.set(key, list);
      } catch {
        // ignore invalid dates
      }
    }
    return map;
  }, [events]);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs font-semibold text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2.5">
            {day}
          </div>
        ))}
      </div>

      {/* Grid days */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b text-xs">
        {calendarDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(dayKey) || [];
          const inCurrentMonth = isSameMonth(day, currentDate);
          const currentDay = isToday(day);

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDay(day)}
              className={`min-h-[110px] p-1.5 transition-colors cursor-pointer flex flex-col hover:bg-muted/30 ${
                !inCurrentMonth ? "bg-muted/20 text-muted-foreground/50" : ""
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                    currentDay
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                  </span>
                )}
              </div>

              {/* Day event list */}
              <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                {dayEvents.map((ev) => {
                  const startTime = ev.start?.dateTime
                    ? format(parseISO(ev.start.dateTime), "p")
                    : "All day";
                  const hasMeet = Boolean(ev.hangoutLink);

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className="group flex flex-col gap-0.5 rounded-md border border-primary/20 bg-primary/5 p-1.5 text-[11px] hover:bg-primary/10 transition-colors"
                      title={`${ev.summary} (${startTime})`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold truncate text-foreground leading-tight">
                          {ev.summary}
                        </span>
                        {hasMeet && (
                          <Video className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{startTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

