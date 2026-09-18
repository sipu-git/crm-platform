import { google } from 'googleapis';
import { googleAccountService } from '../../../shared/integrations/google/google.account.service.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { CreateEventInput, ListEventsQuery, UpdateEventInput } from './calendar.schema.js';

export const calendarService = {
  /**
   * Get an initialized google.calendar client for a user.
   */
  async getCalendarClient(userId: string) {
    const authClient = await googleAccountService.getAuthorizedOAuth2Client(userId);
    return google.calendar({ version: 'v3', auth: authClient });
  },

  /**
   * List upcoming calendar events for a user.
   */
  async listEvents(userId: string, query: ListEventsQuery) {
    const calendar = await this.getCalendarClient(userId);
    const calendarId = query.calendarId || 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin: query.timeMin ?? new Date().toISOString(),
      ...(query.timeMax ? { timeMax: query.timeMax } : {}),
      maxResults: query.maxResults ?? 50,
      singleEvents: true,
      orderBy: 'startTime',
      ...(query.q ? { q: query.q } : {}),
    });

    const events = response.data.items ?? [];
    return events.map((event) => ({
      id: event.id,
      summary: event.summary ?? '(No Title)',
      description: event.description ?? '',
      location: event.location ?? '',
      status: event.status ?? 'confirmed',
      htmlLink: event.htmlLink ?? '',
      hangoutLink: event.hangoutLink ?? event.conferenceData?.entryPoints?.[0]?.uri ?? null,
      start: event.start,
      end: event.end,
      attendees: event.attendees ?? [],
      created: event.created,
      updated: event.updated,
    }));
  },

  /**
   * Get details of a specific event.
   */
  async getEvent(userId: string, eventId: string, calendarId = 'primary') {
    const calendar = await this.getCalendarClient(userId);
    try {
      const response = await calendar.events.get({
        calendarId,
        eventId,
      });
      return response.data;
    } catch (err: any) {
      if (err.status === 404 || err.code === 404) {
        throw new ApiError(404, `Calendar event with ID "${eventId}" not found`);
      }
      throw err;
    }
  },

  
  async createEvent(userId: string, input: CreateEventInput) {
    const calendar = await this.getCalendarClient(userId);
    const calendarId = input.calendarId || 'primary';
    const timeZone = input.timeZone || 'UTC';

    const requestBody: any = {
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: {
        dateTime: input.startDateTime,
        timeZone,
      },
      end: {
        dateTime: input.endDateTime,
        timeZone,
      },
      ...(input.attendees?.length
        ? { attendees: input.attendees.map((email) => ({ email })) }
        : {}),
    };

    if (input.createMeetLink) {
      requestBody.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody,
      conferenceDataVersion: input.createMeetLink ? 1 : 0,
    });

    const event = response.data;
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink ?? event.conferenceData?.entryPoints?.[0]?.uri ?? null,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
    };
  },

  /**
   * Update an existing event on Google Calendar.
   */
  async updateEvent(userId: string, eventId: string, input: UpdateEventInput) {
    const calendar = await this.getCalendarClient(userId);
    const calendarId = input.calendarId || 'primary';

    // Get existing event to patch fields cleanly
    const existing = await this.getEvent(userId, eventId, calendarId);

    const timeZone = input.timeZone || existing.start?.timeZone || 'UTC';

    const requestBody: any = {
      ...existing,
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.startDateTime ? { start: { dateTime: input.startDateTime, timeZone } } : {}),
      ...(input.endDateTime ? { end: { dateTime: input.endDateTime, timeZone } } : {}),
      ...(input.attendees ? { attendees: input.attendees.map((email) => ({ email })) } : {}),
    };

    if (input.createMeetLink && !existing.conferenceData) {
      requestBody.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody,
      conferenceDataVersion: input.createMeetLink ? 1 : 0,
    });

    const event = response.data;
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink ?? event.conferenceData?.entryPoints?.[0]?.uri ?? null,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
    };
  },

  /**
   * Delete an event from Google Calendar.
   */
  async deleteEvent(userId: string, eventId: string, calendarId = 'primary') {
    const calendar = await this.getCalendarClient(userId);
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    return { deleted: true, eventId };
  },

  /**
   * List all calendars accessible by the user.
   */
  async listCalendars(userId: string) {
    const calendar = await this.getCalendarClient(userId);
    const response = await calendar.calendarList.list();
    const calendars = response.data.items ?? [];
    return calendars.map((c) => ({
      id: c.id,
      summary: c.summary,
      description: c.description,
      primary: c.primary ?? false,
      timeZone: c.timeZone,
      accessRole: c.accessRole,
    }));
  },

  /**
   * List public holiday / festival events directly from Google Calendar APIs.
   */
  async listHolidays(userId: string, query: ListEventsQuery) {
    const calendar = await this.getCalendarClient(userId);

    // 1. Try to discover user's subscribed holiday calendars
    let holidayCalendarIds: string[] = [];
    try {
      const listRes = await calendar.calendarList.list();
      const items = listRes.data.items ?? [];
      const userHolidayCals = items
        .filter((c) => c.id?.toLowerCase().includes('holiday') || c.summary?.toLowerCase().includes('holiday'))
        .map((c) => c.id!)
        .filter(Boolean);

      if (userHolidayCals.length > 0) {
        holidayCalendarIds = userHolidayCals;
      }
    } catch {
      // Ignore list error
    }

    // Default to standard Google public holiday calendars if none found
    if (holidayCalendarIds.length === 0) {
      holidayCalendarIds = [
        'en.indian#holiday@group.v.calendar.google.com',
        'en.usa#holiday@group.v.calendar.google.com',
      ];
    }

    const allHolidays: any[] = [];
    const seenEventKeys = new Set<string>();

    for (const calId of holidayCalendarIds) {
      try {
        const response = await calendar.events.list({
          calendarId: calId,
          timeMin: query.timeMin ?? new Date().toISOString(),
          ...(query.timeMax ? { timeMax: query.timeMax } : {}),
          maxResults: query.maxResults ?? 50,
          singleEvents: true,
          orderBy: 'startTime',
          ...(query.q ? { q: query.q } : {}),
        });

        const items = response.data.items ?? [];
        for (const event of items) {
          const key = `${event.summary}-${event.start?.date || event.start?.dateTime}`;
          if (seenEventKeys.has(key)) continue;
          seenEventKeys.add(key);

          allHolidays.push({
            id: `holiday-${event.id}`,
            summary: event.summary ?? '(Public Holiday)',
            description: event.description ?? 'Public Holiday',
            location: event.location ?? '',
            status: event.status ?? 'confirmed',
            htmlLink: event.htmlLink ?? '',
            hangoutLink: null,
            start: event.start,
            end: event.end,
            created: event.created,
            updated: event.updated,
            isHoliday: true,
            category: 'holiday',
          });
        }
      } catch {
        // Ignore calendar fetch failure for unsupported or restricted calendars
      }
    }

    return allHolidays;
  },
};


