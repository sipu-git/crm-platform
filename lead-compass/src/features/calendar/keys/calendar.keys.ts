import type { ListEventsQuery } from "../types";

export const calendarKeys = {
  all: ["calendar"] as const,
  status: () => [...calendarKeys.all, "status"] as const,
  list: (filters?: ListEventsQuery) => [...calendarKeys.all, "list", filters] as const,
  holidays: (filters?: ListEventsQuery) => [...calendarKeys.all, "holidays", filters] as const,
  detail: (id: string) => [...calendarKeys.all, "detail", id] as const,
  calendars: () => [...calendarKeys.all, "user-calendars"] as const,
};

