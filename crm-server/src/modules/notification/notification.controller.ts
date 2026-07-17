import type { Request, Response } from 'express';
import { notificationService } from './notification.service';

export const notificationController = {
  async listUnread(req: Request, res: Response) {
    const notifications = await notificationService.listUnread(req.tenantId!, req.auth!.userId);
    res.json(notifications);
  },

  async markRead(req: Request, res: Response) {
    await notificationService.markAsRead(req.tenantId!, req.auth!.userId, req.params.id as string);
    res.status(204).send();
  },

  async markAllRead(req: Request, res: Response) {
    await notificationService.markAllAsRead(req.tenantId!, req.auth!.userId);
    res.status(204).send();
  },
};
