import { NotificationStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

export interface CreateNotificationInput {
  channel: string;
  subject: string;
  message: string;
  status?: NotificationStatus;
  external_ref?: string;
  error_message?: string;
  sent_at?: Date;
}

export const notificationRepository = {
  findUnread(tenantId: string, userId: string) {
    return prisma.notification.findMany({
      where: { tenant_id: tenantId, recipient_id: userId, isRead: false },
      orderBy: { created_at: "desc" },
    });
  },

  findMany(tenantId: string, userId: string) {
    return prisma.notification.findMany({
      where: { tenant_id: tenantId, recipient_id: userId },
      orderBy: { created_at: "desc" },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.notification.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  create(tenantId: string, userId: string, input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        tenant_id: tenantId,
        recipient_id: userId,
        channel: input.channel,
        subject: input.subject,
        message: input.message,
        status: input.status ?? NotificationStatus.PENDING,
        external_ref: input.external_ref ?? "",
        error_message: input.error_message ?? "",
        sent_at: input.sent_at ?? new Date(),
      },
    });
  },

  updateStatus(
    tenantId: string,
    id: string,
    status: NotificationStatus,
    options: { errorMessage?: string; externalRef?: string } = {}
  ) {
    return prisma.notification.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        status,
        error_message: options.errorMessage ?? "",
        external_ref: options.externalRef,
        sent_at: new Date(),
      },
    });
  },

  markRead(tenantId: string, userId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, tenant_id: tenantId, recipient_id: userId },
      data: { isRead: true },
    });
  },

  markAllRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { tenant_id: tenantId, recipient_id: userId, isRead: false },
      data: { isRead: true },
    });
  },
};