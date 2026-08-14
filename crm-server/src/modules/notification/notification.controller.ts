import type { Request, Response } from 'express';
import { notificationService } from './notification.service.js';

export const notificationController = {
  async listUnread(req: Request, res: Response) {
    const notifications = await notificationService.listUnread(req.tenantId!, req.auth!.userId);
    res.json(notifications);
  },

  async listAll(req: Request, res: Response) {
    const { limit, cursor } = req.query;

    const notifications = await notificationService.getAllNotifications(
      req.tenantId!,
      req.auth!.userId,
      {
        limit: limit ? Number(limit) : undefined,
        cursor: typeof cursor === "string" ? cursor : undefined,
      }
    );
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
  async removeAllNotification(req: Request, res: Response) {
    const {messageId}= req.body as {messageId?:string[]}
    await notificationService.removeNotification(req.tenantId!, req.auth?.userId!,messageId)
    res.status(200).send()
  }
};
