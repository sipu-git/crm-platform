import { z } from 'zod';

export const createEventSchema = z.object({
  calendarId: z.string().default('primary'),
  summary: z.string().trim().min(1, 'Event title (summary) is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDateTime: z.string().datetime({ message: 'startDateTime must be a valid ISO-8601 string' }),
  endDateTime: z.string().datetime({ message: 'endDateTime must be a valid ISO-8601 string' }),
  timeZone: z.string().optional().default('UTC'),
  attendees: z.array(z.string().email('Attendee must be a valid email')).optional(),
  createMeetLink: z.boolean().optional().default(false),
});

export const updateEventSchema = z.object({
  calendarId: z.string().default('primary'),
  summary: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  timeZone: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
  createMeetLink: z.boolean().optional(),
});

export const listEventsQuerySchema = z.object({
  calendarId: z.string().default('primary'),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
  maxResults: z.coerce.number().min(1).max(250).optional().default(50),
  q: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

