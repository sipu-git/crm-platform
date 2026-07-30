import { NotificationStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
export const notificationRepository = {
    findUnread(tenantId, userId) {
        return prisma.notification.findMany({
            where: { tenant_id: tenantId, recipient_id: userId, isRead: false },
            orderBy: { created_at: "desc" },
        });
    },
    findMany(tenantId, userId) {
        return prisma.notification.findMany({
            where: { tenant_id: tenantId, recipient_id: userId },
            orderBy: { created_at: "desc" },
        });
    },
    findById(tenantId, id) {
        return prisma.notification.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    create(tenantId, userId, input) {
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
    updateStatus(tenantId, id, status, options = {}) {
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
    markRead(tenantId, userId, id) {
        return prisma.notification.updateMany({
            where: { id, tenant_id: tenantId, recipient_id: userId },
            data: { isRead: true },
        });
    },
    markAllRead(tenantId, userId) {
        return prisma.notification.updateMany({
            where: { tenant_id: tenantId, recipient_id: userId, isRead: false },
            data: { isRead: true },
        });
    },
};
