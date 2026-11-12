import { z } from "zod";

const dateTime = z.string().datetime();
const timeZone = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "timeZone must be a valid IANA time zone");

export const createEventSchema = z
  .object({
    summary: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .refine(
        (value) => !/[\r\n]/.test(value),
        "Event title cannot contain line breaks",
      ),
    description: z.string().trim().max(5000).optional(),
    location: z.string().trim().max(300).optional(),
    startDateTime: dateTime,
    endDateTime: dateTime,
    timeZone: timeZone.default("UTC"),
  })
  .refine(
    (event) => new Date(event.endDateTime) > new Date(event.startDateTime),
    {
      message: "End time must be after start time",
      path: ["endDateTime"],
    },
  );

export const updateEventSchema = z.object({
  summary: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  location: z.string().trim().max(300).optional(),
  startDateTime: dateTime.optional(),
  endDateTime: dateTime.optional(),
  timeZone: timeZone.optional(),
});

export const listEventsQuerySchema = z.object({
  timeMin: dateTime.optional(),
  timeMax: dateTime.optional(),
  maxResults: z.coerce.number().int().min(1).max(250).default(100),
  q: z.string().trim().max(200).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
