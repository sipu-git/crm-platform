import { NotificationStatus } from "../../../generated/prisma/enums";
import { notificationRepository, CreateNotificationInput } from "./notification.repository";
import { emitToUser } from "./socket";

export class NotificationNotFoundError extends Error {
  constructor(id: string) {
    super(`Notification ${id} not found`);
    this.name = "NotificationNotFoundError";
  }
}

export class InvalidNotificationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNotificationInputError";
  }
}

export interface SendNotificationInput {
  channel: string;
  subject: string;
  message: string;
  externalRef?: string;
}

function assertNonEmpty(value: string, field: string) {
  if (!value || !value.trim()) {
    throw new InvalidNotificationInputError(`${field} is required`);
  }
}

export const notificationService = {
  async listUnread(tenantId: string, userId: string) {
    return notificationRepository.findUnread(tenantId, userId);
  },

  /**
   * Get full notification history for a user.
   */
  async getAllNotifications(tenantId: string, userId: string) {
    return notificationRepository.findMany(tenantId, userId);
  },

  /**
   * Central dispatch — persists the notification in PENDING status
   * AND pushes it live via Socket.io. Actual delivery through the
   * external channel (email/sms/push) is handled separately by a
   * worker that later calls markSent / markFailed.
   */
  async dispatch(
    tenantId: string,
    userId: string,
    input: SendNotificationInput
  ) {
    assertNonEmpty(input.channel, "channel");
    assertNonEmpty(input.subject, "subject");
    assertNonEmpty(input.message, "message");

    const data: CreateNotificationInput = {
      channel: input.channel,
      subject: input.subject,
      message: input.message,
      status: NotificationStatus.PENDING,
      external_ref: input.externalRef ?? "",
      error_message: "",
      sent_at: new Date(),
    };

    const notification = await notificationRepository.create(
      tenantId,
      userId,
      data
    );

    emitToUser(userId, "notification:new", notification);

    return notification;
  },

  async markSent(tenantId: string, id: string, externalRef: string) {
    const notification = await notificationRepository.findById(tenantId, id);
    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    const result = await notificationRepository.updateStatus(tenantId, id, NotificationStatus.SENT, { externalRef });

    if (result.count === 0) {
      throw new NotificationNotFoundError(id);
    }

    emitToUser(notification.recipient_id, "notification:status", {
      id,
      status: NotificationStatus.SENT,
      externalRef,
    });

    return result;
  },

  /**
   * Mark a notification as failed, storing the error reason.
   */
  async markFailed(tenantId: string, id: string, errorMessage: string) {
    const notification = await notificationRepository.findById(tenantId, id);
    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    const result = await notificationRepository.updateStatus(tenantId,id,NotificationStatus.FAILED,{ errorMessage });

    emitToUser(notification.recipient_id, "notification:status", {
      id,
      status: NotificationStatus.FAILED,
      errorMessage,
    });

    return result;
  },

  /**
   * Mark a single notification as read, scoped to the requesting user.
   */
  async markAsRead(tenantId: string, userId: string, id: string) {
    const result = await notificationRepository.markRead(
      tenantId,
      userId,
      id
    );

    if (result.count === 0) {
      throw new NotificationNotFoundError(id);
    }

    emitToUser(userId, "notification:read", { id });

    return result;
  },

  /**
   * Mark every unread notification for a user as read.
   */
  async markAllAsRead(tenantId: string, userId: string) {
    const result = await notificationRepository.markAllRead(tenantId, userId);
    emitToUser(userId, "notification:read-all", {});
    return result;
  },
};