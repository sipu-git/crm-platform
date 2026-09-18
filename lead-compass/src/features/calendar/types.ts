export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  status: string;
  htmlLink?: string;
  hangoutLink?: string | null;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  created?: string;
  updated?: string;
}

export interface CreateCalendarEventInput {
  calendarId?: string;
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  attendees?: string[];
  createMeetLink?: boolean;
}

export interface UpdateCalendarEventInput {
  calendarId?: string;
  summary?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  timeZone?: string;
  attendees?: string[];
  createMeetLink?: boolean;
}

export interface GoogleAccountStatus {
  connected: boolean;
  email?: string;
  id?: string;
}

export interface ListEventsQuery {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  q?: string;
}

export interface UserCalendar {
  id: string;
  summary: string;
  description?: string;
  primary: boolean;
  timeZone?: string;
  accessRole?: string;
}

