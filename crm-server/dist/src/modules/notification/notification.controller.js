import { notificationService } from './notification.service.js';
export const notificationController = {
    async listUnread(req, res) {
        const notifications = await notificationService.listUnread(req.tenantId, req.auth.userId);
        res.json(notifications);
    },
    async markRead(req, res) {
        await notificationService.markAsRead(req.tenantId, req.auth.userId, req.params.id);
        res.status(204).send();
    },
    async markAllRead(req, res) {
        await notificationService.markAllAsRead(req.tenantId, req.auth.userId);
        res.status(204).send();
    },
};
