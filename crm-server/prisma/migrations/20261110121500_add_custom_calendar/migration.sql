CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_by" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start_at" TIMESTAMPTZ(3) NOT NULL,
    "end_at" TIMESTAMPTZ(3) NOT NULL,
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalendarReminderDelivery" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "push_notification_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "due_at" TIMESTAMPTZ(3) NOT NULL,
    "next_attempt_at" TIMESTAMPTZ(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "claimed_at" TIMESTAMPTZ(3),
    "sent_at" TIMESTAMPTZ(3),
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "CalendarReminderDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalendarEvent_tenant_id_start_at_idx" ON "CalendarEvent"("tenant_id", "start_at");
CREATE UNIQUE INDEX "CalendarReminderDelivery_event_id_recipient_id_channel_key"
    ON "CalendarReminderDelivery"("event_id", "recipient_id", "channel");
CREATE UNIQUE INDEX "CalendarReminderDelivery_push_notification_id_key"
    ON "CalendarReminderDelivery"("push_notification_id");
CREATE INDEX "CalendarReminderDelivery_status_next_attempt_at_idx"
    ON "CalendarReminderDelivery"("status", "next_attempt_at");
CREATE INDEX "CalendarReminderDelivery_event_id_idx" ON "CalendarReminderDelivery"("event_id");

ALTER TABLE "CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CalendarReminderDelivery"
    ADD CONSTRAINT "CalendarReminderDelivery_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarReminderDelivery"
    ADD CONSTRAINT "CalendarReminderDelivery_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarReminderDelivery"
    ADD CONSTRAINT "CalendarReminderDelivery_recipient_id_fkey"
    FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarReminderDelivery"
    ADD CONSTRAINT "CalendarReminderDelivery_push_notification_id_fkey"
    FOREIGN KEY ("push_notification_id") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
