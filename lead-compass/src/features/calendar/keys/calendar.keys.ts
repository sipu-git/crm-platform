import type { ListEventsQuery } from "../types";

export const calendarKeys = {
  all: ["calendar"] as const,
  list: (tenantSlug: string, filters?: ListEventsQuery) =>
    [...calendarKeys.all, "list", tenantSlug, filters] as const,
  detail: (id: string) => [...calendarKeys.all, "detail", id] as const,
};
