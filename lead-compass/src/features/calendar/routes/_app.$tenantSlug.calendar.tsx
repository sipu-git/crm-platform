import { useState, useMemo } from "react";
import { useCalendarEvents } from "@/features/calendar/hooks/useCalendar";
import type { CalendarEvent } from "@/features/calendar/types";
import { GoogleConnectBanner } from "@/features/calendar/components/GoogleConnectBanner";
import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarMonthView } from "@/features/calendar/components/CalendarMonthView";
import { CalendarAgendaView } from "@/features/calendar/components/CalendarAgendaView";
import { EventDialog } from "@/features/calendar/components/EventDialog";
import { DeleteEventDialog } from "@/features/calendar/components/DeleteEventDialog";
import { PageHeader, TableSkeleton } from "@/components/ui-kit";
import { addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog States
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateForNew, setSelectedDateForNew] = useState<Date | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Time range calculation for API listEvents
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const timeMin = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }).toISOString(), [monthStart]);
  const timeMax = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }).toISOString(), [monthEnd]);
  const todayIso = useMemo(() => new Date().toISOString(), []);

  const {
    data: events = [],
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useCalendarEvents({
    timeMin: viewMode === "month" ? timeMin : todayIso,
    ...(viewMode === "month" ? { timeMax } : {}),
    ...(searchQuery ? { q: searchQuery } : {}),
  });

  const handleNavigateMonth = (delta: number) => {
    setCurrentDate((prev) => addMonths(prev, delta));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenNewEvent = (initialDay?: Date) => {
    setSelectedEvent(null);
    setSelectedDateForNew(initialDay || null);
    setEventDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDateForNew(null);
    setEventDialogOpen(true);
  };

  const handleDeletePrompt = (event: CalendarEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Schedule events, manage Google Meet calls, and sync your team timeline with Google Calendar."
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Google Account Connection Status Card */}
        <GoogleConnectBanner />

        {/* Calendar Control Bar */}
        <CalendarHeader
          currentDate={currentDate}
          onNavigateMonth={handleNavigateMonth}
          onToday={handleToday}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
          onNewEvent={() => handleOpenNewEvent()}
        />

        {isError && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
            Could not load Google Calendar events. Make sure your Google Account is connected.
          </div>
        )}

        {/* View Component */}
        {isLoading && !events.length ? (
          <TableSkeleton />
        ) : viewMode === "month" ? (
          <CalendarMonthView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleSelectEvent}
            onSelectDay={(day) => handleOpenNewEvent(day)}
          />
        ) : (
          <CalendarAgendaView
            events={events}
            onSelectEvent={handleSelectEvent}
            onDeleteEvent={handleDeletePrompt}
          />
        )}
      </div>

      {/* Create / Edit Event Modal */}
      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        eventToEdit={selectedEvent}
        initialDate={selectedDateForNew}
      />

      {/* Delete Event Modal */}
      <DeleteEventDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        eventToDelete={eventToDelete}
      />
    </div>
  );
}

export default CalendarPage;
