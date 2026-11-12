import { NotificationStatus } from "../../../../generated/prisma/enums.js";
import { prisma } from "../../../../lib/prisma.js";
import { notificationRepository } from "../../notification/repository/notification.repository.js";
import { sendPush } from "../../notification/utils/push-worker.js";
import { sendCalendarReminderEmail } from "./calendar-reminder-email.service.js";

const POLL_INTERVAL_MS = 60_000;
const CLAIM_TIMEOUT_MS = 5 * 60_000;
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;

let timer: ReturnType<typeof setInterval> | undefined;
let isRunning = false;

async function deliverPush(delivery: {
  id: string;
  tenant_id: string;
  recipient_id: string;
  push_notification_id: string | null;
  event: { summary: string; start_at: Date; time_zone: string };
}) {
  const externalRef = `calendar-reminder:${delivery.id}`;
  let notification = delivery.push_notification_id
    ? await notificationRepository.findById(
        delivery.tenant_id,
        delivery.push_notification_id,
      )
    : await notificationRepository.findByExternalRef(
        delivery.tenant_id,
        externalRef,
      );
  if (!notification) {
    const startTime = new Intl.DateTimeFormat("en", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: delivery.event.time_zone,
    }).format(delivery.event.start_at);
    notification = await notificationRepository.create(
      delivery.tenant_id,
      delivery.recipient_id,
      {
        channel: "CALENDAR_REMINDER",
        subject: "Upcoming calendar event",
        message: `${delivery.event.summary} starts tomorrow at ${startTime}.`,
        status: NotificationStatus.PENDING,
        external_ref: externalRef,
      },
    );
  }
  if (delivery.push_notification_id !== notification.id) {
    await prisma.calendarReminderDelivery.update({
      where: { id: delivery.id },
      data: { push_notification_id: notification.id },
    });
  }
  if (notification.status === NotificationStatus.SENT) return;

  await sendPush(delivery.tenant_id, notification);
  const result = await notificationRepository.findById(
    delivery.tenant_id,
    notification.id,
  );
  if (result?.status !== NotificationStatus.SENT) {
    throw new Error(
      result?.error_message || "Calendar reminder push could not be delivered",
    );
  }
}

async function deliver(delivery: {
  id: string;
  tenant_id: string;
  recipient_id: string;
  push_notification_id: string | null;
  channel: string;
  event: {
    summary: string;
    description: string | null;
    location: string | null;
    start_at: Date;
    time_zone: string;
  };
  recipient: { email: string; full_name: string };
}) {
  if (delivery.channel === "web-push") {
    await deliverPush(delivery);
    return;
  }
  if (delivery.channel === "email") {
    await sendCalendarReminderEmail({
      email: delivery.recipient.email,
      name: delivery.recipient.full_name,
      summary: delivery.event.summary,
      description: delivery.event.description,
      location: delivery.event.location,
      startsAt: delivery.event.start_at,
      timeZone: delivery.event.time_zone,
    });
    return;
  }
  throw new Error(`Unsupported calendar reminder channel: ${delivery.channel}`);
}

async function processDueReminders() {
  if (isRunning) return;
  isRunning = true;
  try {
    const now = new Date();
    const staleClaimBefore = new Date(now.getTime() - CLAIM_TIMEOUT_MS);
    const due = await prisma.calendarReminderDelivery.findMany({
      where: {
        next_attempt_at: { lte: now },
        event: { is: { start_at: { gt: now } } },
        OR: [
          { status: "PENDING" },
          { status: "FAILED", attempts: { lt: MAX_ATTEMPTS } },
          { status: "PROCESSING", claimed_at: { lte: staleClaimBefore } },
        ],
      },
      include: {
        event: true,
        recipient: { select: { email: true, full_name: true } },
      },
      orderBy: { next_attempt_at: "asc" },
      take: BATCH_SIZE,
    });

    for (const delivery of due) {
      const claim = await prisma.calendarReminderDelivery.updateMany({
        where: {
          id: delivery.id,
          OR: [
            { status: "PENDING" },
            { status: "FAILED", attempts: { lt: MAX_ATTEMPTS } },
            { status: "PROCESSING", claimed_at: { lte: staleClaimBefore } },
          ],
        },
        data: {
          status: "PROCESSING",
          claimed_at: now,
          attempts: { increment: 1 },
        },
      });
      if (claim.count === 0) continue;

      const attempt = delivery.attempts + 1;
      try {
        await deliver(delivery);
        await prisma.calendarReminderDelivery.updateMany({
          where: { id: delivery.id, status: "PROCESSING" },
          data: {
            status: "SENT",
            sent_at: new Date(),
            claimed_at: null,
            last_error: null,
          },
        });
      } catch (error) {
        const nextAttemptAt = new Date(
          now.getTime() + 5 * 60_000 * 2 ** (attempt - 1),
        );
        await prisma.calendarReminderDelivery.updateMany({
          where: { id: delivery.id, status: "PROCESSING" },
          data: {
            status: "FAILED",
            next_attempt_at: nextAttemptAt,
            claimed_at: null,
            last_error: (error instanceof Error
              ? error.message
              : "Reminder delivery failed"
            ).slice(0, 1000),
          },
        });
        console.error("Calendar reminder delivery failed", {
          deliveryId: delivery.id,
          eventId: delivery.event_id,
          channel: delivery.channel,
          attempt,
          error,
        });
      }
    }
  } finally {
    isRunning = false;
  }
}

export function startCalendarReminderWorker() {
  if (timer) return;
  void processDueReminders().catch((error) => {
    console.error("Calendar reminder worker failed", error);
  });
  timer = setInterval(() => {
    void processDueReminders().catch((error) => {
      console.error("Calendar reminder worker failed", error);
    });
  }, POLL_INTERVAL_MS);
  timer.unref();
}
