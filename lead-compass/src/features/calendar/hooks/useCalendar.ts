import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { calendarApi } from "../apis/calendar.api";
import { calendarKeys } from "../keys/calendar.keys";
import type {
  CreateCalendarEventInput,
  ListEventsQuery,
  UpdateCalendarEventInput,
} from "../types";

const cacheConfig = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  refetchInterval: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const; 

type QueryOverrides<TData> = Partial<Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
>;

export function useCalendarStatus() {
  return useQuery({
    queryKey: calendarKeys.status(),
    queryFn: () => calendarApi.getStatus(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCalendarEvents(
  filters?: ListEventsQuery,
  options?: { enabled?: boolean } & QueryOverrides<Awaited<ReturnType<typeof calendarApi.listEvents>>>
) {
  const { enabled = true, ...overrides } = options ?? {};

  return useQuery({
    queryKey: calendarKeys.list(filters),
    queryFn: () => calendarApi.listEvents(filters),
    enabled,
    ...cacheConfig,
    ...overrides,
  });
}

export function useCalendarHolidays(
  filters?: ListEventsQuery,
  options?: { enabled?: boolean } & QueryOverrides<Awaited<ReturnType<typeof calendarApi.listHolidays>>>
) {
  const { enabled = true, ...overrides } = options ?? {};

  return useQuery({
    queryKey: calendarKeys.holidays(filters),
    queryFn: () => calendarApi.listHolidays(filters),
    enabled,
    staleTime: 1000 * 60 * 60,
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    retry: 1,
    ...overrides,
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