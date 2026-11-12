import { prisma } from "../../../../lib/prisma.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import type { PrismaClientTx } from "../../../shared/utils/prisma.types.js";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "./calendar.schema.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_CHANNELS = ["web-push", "email"] as const;

const eventInclude = {
  creator: { select: { id: true, full_name: true } },
};

function toCalendarEvent(event: {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start_at: Date;
  end_at: Date;
  time_zone: string;
  created_at: Date;
  updated_at: Date;
  creator: { id: string; full_name: string } | null;
}) {
  return {
    id: event.id,
    summary: event.summary,
    description: event.description ?? "",
    location: event.location ?? "",
    status: "confirmed",
    start: {
      dateTime: event.start_at.toISOString(),
      timeZone: event.time_zone,
    },
    end: { dateTime: event.end_at.toISOString(), timeZone: event.time_zone },
    createdBy: event.creator
      ? { id: event.creator.id, name: event.creator.full_name }
      : null,
    created: event.created_at.toISOString(),
    updated: event.updated_at.toISOString(),
  };
}

async function scheduleTenantReminders(
  tx: PrismaClientTx,
  event: { id: string; tenant_id: string; start_at: Date },
) {
  const now = new Date();
  if (event.start_at <= now) {
    await tx.calendarReminderDelivery.updateMany({
      where: {
        event_id: event.id,
        status: { in: ["PENDING", "FAILED", "CANCELLED"] },
      },
      data: { status: "CANCELLED" },
    });
    return;
  }

  const dueAt = new Date(
    Math.max(event.start_at.getTime() - DAY_MS, now.getTime()),
  );
  await tx.calendarReminderDelivery.updateMany({
    where: {
      event_id: event.id,
      status: { in: ["PENDING", "FAILED", "CANCELLED"] },
    },
    data: {
      status: "PENDING",
      due_at: dueAt,
      next_attempt_at: dueAt,
      attempts: 0,
      claimed_at: null,
      sent_at: null,
      last_error: null,
    },
  });

  const users = await tx.user.findMany({
    where: { tenantId: event.tenant_id },
    select: { id: true },
  });
  if (!users.length) return;

  await tx.calendarReminderDelivery.createMany({
    data: users.flatMap((user) =>
      REMINDER_CHANNELS.map((channel) => ({
        event_id: event.id,
        tenant_id: event.tenant_id,
        recipient_id: user.id,
        channel,
        due_at: dueAt,
        next_attempt_at: dueAt,
      })),
    ),
    skipDuplicates: true,
  });
}

export const calendarService = {
  async listEvents(tenantId: string, query: ListEventsQuery) {
    const timeMin = query.timeMin ? new Date(query.timeMin) : undefined;
    const timeMax = query.timeMax ? new Date(query.timeMax) : undefined;
    if (timeMin && timeMax && timeMin >= timeMax) {
      throw ApiError.badRequest("timeMax must be later than timeMin");
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        tenant_id: tenantId,
        ...(timeMin || timeMax
          ? {
              AND: [
                ...(timeMin ? [{ end_at: { gt: timeMin } }] : []),
                ...(timeMax ? [{ start_at: { lt: timeMax } }] : []),
              ],
            }
          : {}),
        ...(query.q
          ? {
              OR: [
                {
                  summary: { contains: query.q, mode: "insensitive" as const },
                },
                {
                  description: {
                    contains: query.q,
                    mode: "insensitive" as const,
                  },
                },
                {
                  location: { contains: query.q, mode: "insensitive" as const },
                },
              ],
            }
          : {}),
      },
      include: eventInclude,
      orderBy: { start_at: "asc" },
      take: query.maxResults,
    });
    return events.map(toCalendarEvent);
  },

  async getEvent(tenantId: string, eventId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, tenant_id: tenantId },
      include: eventInclude,
    });
    if (!event) throw new ApiError(404, "Calendar event not found");
    return toCalendarEvent(event);
  },

  async createEvent(tenantId: string, userId: string, input: CreateEventInput) {
    const startAt = new Date(input.startDateTime);
    const endAt = new Date(input.endDateTime);
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.calendarEvent.create({
        data: {
          tenant_id: tenantId,
          created_by: userId,
          summary: input.summary,
          description: input.description || null,
          location: input.location || null,
          start_at: startAt,
          end_at: endAt,
          time_zone: input.timeZone,
        },
      });
      await scheduleTenantReminders(tx, created);
      return tx.calendarEvent.findFirstOrThrow({
        where: { id: created.id, tenant_id: tenantId },
        include: eventInclude,
      });
    });
    return toCalendarEvent(event);
  },

  async updateEvent(
    tenantId: string,
    eventId: string,
    input: UpdateEventInput,
  ) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: eventId, tenant_id: tenantId },
    });
    if (!existing) throw new ApiError(404, "Calendar event not found");

    const startAt = input.startDateTime
      ? new Date(input.startDateTime)
      : existing.start_at;
    const endAt = input.endDateTime
      ? new Date(input.endDateTime)
      : existing.end_at;
    if (endAt <= startAt) {
      throw ApiError.badRequest("End time must be after start time");
    }

    const event = await prisma.$transaction(async (tx) => {
      const updated = await tx.calendarEvent.update({
        where: { id: existing.id },
        data: {
          ...(input.summary !== undefined ? { summary: input.summary } : {}),
          ...(input.description !== undefined
            ? { description: input.description || null }
            : {}),
          ...(input.location !== undefined
            ? { location: input.location || null }
            : {}),
          ...(input.startDateTime ? { start_at: startAt } : {}),
          ...(input.endDateTime ? { end_at: endAt } : {}),
          ...(input.timeZone ? { time_zone: input.timeZone } : {}),
        },
      });
      await scheduleTenantReminders(tx, updated);
      return tx.calendarEvent.findFirstOrThrow({
        where: { id: updated.id, tenant_id: tenantId },
        include: eventInclude,
      });
    });
    return toCalendarEvent(event);
  },

  async deleteEvent(tenantId: string, eventId: string) {
    const result = await prisma.calendarEvent.deleteMany({
      where: { id: eventId, tenant_id: tenantId },
    });
    if (result.count === 0) throw new ApiError(404, "Calendar event not found");
    return { deleted: true, eventId };
  },
};
