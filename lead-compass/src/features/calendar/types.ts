export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  status: string;
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
  createdBy?: { id: string; name: string } | null;
  created?: string;
  updated?: string;
}

export interface CreateCalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
}

export interface UpdateCalendarEventInput {
  summary?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  timeZone?: string;
}

export interface ListEventsQuery {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  q?: string;
}
