import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { calendarApi } from "../apis/calendar.api";
import { calendarKeys } from "../keys/calendar.keys";
import type { CreateCalendarEventInput, ListEventsQuery, UpdateCalendarEventInput } from "../types";

const cacheConfig = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
  retry: 1,
};

export function useCalendarEvents(filters?: ListEventsQuery) {
  const { tenantSlug = "" } = useParams<{ tenantSlug: string }>();
  return useQuery({
    queryKey: calendarKeys.list(tenantSlug, filters),
    queryFn: () => calendarApi.listEvents(filters),
    ...cacheConfig,
  });
}

export function useCalendarMutations() {
  const queryClient = useQueryClient();
  const refreshEvents = () => queryClient.invalidateQueries({ queryKey: calendarKeys.all });

  return {
    createEvent: useMutation({
      mutationFn: (value: CreateCalendarEventInput) => calendarApi.createEvent(value),
      onSuccess: refreshEvents,
    }),
    updateEvent: useMutation({
      mutationFn: ({ id, value }: { id: string; value: UpdateCalendarEventInput }) =>
        calendarApi.updateEvent(id, value),
      onSuccess: refreshEvents,
    }),
    deleteEvent: useMutation({
      mutationFn: (id: string) => calendarApi.deleteEvent(id),
      onSuccess: refreshEvents,
    }),
  };
}
