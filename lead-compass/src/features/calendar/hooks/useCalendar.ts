import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calendarApi } from "../apis/calendar.api";
import { calendarKeys } from "../keys/calendar.keys";
import type {
  CreateCalendarEventInput,
  ListEventsQuery,
  UpdateCalendarEventInput,
} from "../types";

const cacheConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchInterval: false as const,
  refetchOnWindowFocus: false,
  retry: 1,
};

export function useCalendarStatus() {
  return useQuery({
    queryKey: calendarKeys.status(),
    queryFn: () => calendarApi.getStatus(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCalendarEvents(filters?: ListEventsQuery, enabled = true) {
  return useQuery({
    queryKey: calendarKeys.list(filters),
    queryFn: () => calendarApi.listEvents(filters),
    enabled,
    ...cacheConfig,
  });
}

export function useCalendarHolidays(filters?: ListEventsQuery, enabled = true) {
  return useQuery({
    queryKey: calendarKeys.holidays(filters),
    queryFn: () => calendarApi.listHolidays(filters),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour for holidays
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUserCalendars(enabled = true) {
  return useQuery({
    queryKey: calendarKeys.calendars(),
    queryFn: () => calendarApi.listCalendars(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCalendarMutations() {
  const qc = useQueryClient();

  const refreshEvents = () =>
    qc.invalidateQueries({ queryKey: calendarKeys.all });

  return {
    createEvent: useMutation({
      mutationFn: (value: CreateCalendarEventInput) => calendarApi.createEvent(value),
      onSuccess: () => refreshEvents(),
    }),

    updateEvent: useMutation({
      mutationFn: ({ id, value }: { id: string; value: UpdateCalendarEventInput }) =>
        calendarApi.updateEvent(id, value),
      onSuccess: () => refreshEvents(),
    }),

    deleteEvent: useMutation({
      mutationFn: ({ id, calendarId }: { id: string; calendarId?: string }) =>
        calendarApi.deleteEvent(id, calendarId),
      onSuccess: () => refreshEvents(),
    }),
  };
}

