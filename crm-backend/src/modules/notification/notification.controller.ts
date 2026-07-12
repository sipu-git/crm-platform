import type { Request, Response } from 'express';
import { notificationService } from './notification.service';

export const notificationController = {
  async listUnread(req: Request, res: Response) {
    const notifications = await notificationService.listUnread(req.tenantId!, req.auth!.userId);
    res.json(notifications);
  },

  async markRead(req: Request, res: Response) {
    await notificationService.markRead(req.tenantId!, req.auth!.userId, req.params.id);
    res.status(204).send();
  },

  async markAllRead(req: Request, res: Response) {
    await notificationService.markAllRead(req.tenantId!, req.auth!.userId);
    res.status(204).send();
  },
};
