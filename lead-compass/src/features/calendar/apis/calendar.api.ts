import { api } from "@/api/client";
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  ListEventsQuery,
  UpdateCalendarEventInput,
} from "../types";

type Envelope<T> = { data: T };
const payload = <T>(response: { data: Envelope<T> }) => response.data.data;

export const calendarApi = {
  async listEvents(query: ListEventsQuery = {}): Promise<CalendarEvent[]> {
    return payload(await api.get<Envelope<CalendarEvent[]>>("/calendar/events", { params: query }));
  },

  async createEvent(value: CreateCalendarEventInput): Promise<CalendarEvent> {
    return payload(await api.post<Envelope<CalendarEvent>>("/calendar/events", value));
  },

  async updateEvent(eventId: string, value: UpdateCalendarEventInput): Promise<CalendarEvent> {
    return payload(await api.patch<Envelope<CalendarEvent>>(`/calendar/events/${eventId}`, value));
  },

  async deleteEvent(eventId: string): Promise<{ deleted: boolean }> {
    return payload(await api.delete<Envelope<{ deleted: boolean }>>(`/calendar/events/${eventId}`));
  },
};
