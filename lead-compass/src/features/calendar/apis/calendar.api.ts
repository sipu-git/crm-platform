import { api } from "@/api/client";
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  GoogleAccountStatus,
  ListEventsQuery,
  UpdateCalendarEventInput,
  UserCalendar,
} from "../types";

type Envelope<T> = { data: T };
const payload = <T,>(response: { data: Envelope<T> }) => response.data.data;

export const calendarApi = {
  async getStatus(): Promise<GoogleAccountStatus> {
    return payload(await api.get<Envelope<GoogleAccountStatus>>("/calendar/status"));
  },

  async getConnectUrl(returnTo = "/calendar"): Promise<{ url: string }> {
    return payload(
      await api.get<Envelope<{ url: string }>>("/calendar/connect", {
        params: { returnTo },
      })
    );
  },

  async listEvents(query: ListEventsQuery = {}): Promise<CalendarEvent[]> {
    return payload(await api.get<Envelope<CalendarEvent[]>>("/calendar/events", { params: query }));
  },

  async listHolidays(query: ListEventsQuery = {}): Promise<CalendarEvent[]> {
    return payload(await api.get<Envelope<CalendarEvent[]>>("/calendar/holidays", { params: query }));
  },

  async getEvent(eventId: string, calendarId = "primary"): Promise<CalendarEvent> {
    return payload(
      await api.get<Envelope<CalendarEvent>>(`/calendar/events/${eventId}`, {
        params: { calendarId },
      })
    );
  },

  async createEvent(value: CreateCalendarEventInput): Promise<CalendarEvent> {
    return payload(await api.post<Envelope<CalendarEvent>>("/calendar/events", value));
  },

  async updateEvent(eventId: string, value: UpdateCalendarEventInput): Promise<CalendarEvent> {
    return payload(await api.patch<Envelope<CalendarEvent>>(`/calendar/events/${eventId}`, value));
  },

  async deleteEvent(eventId: string, calendarId = "primary"): Promise<{ deleted: boolean }> {
    return payload(
      await api.delete<Envelope<{ deleted: boolean }>>(`/calendar/events/${eventId}`, {
        params: { calendarId },
      })
    );
  },

  async listCalendars(): Promise<UserCalendar[]> {
    return payload(await api.get<Envelope<UserCalendar[]>>("/calendar/list"));
  },
};

