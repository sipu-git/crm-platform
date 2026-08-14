import type { Request, Response } from "express";
import { deviceTokenService } from "./device-token.service.js";

export const deviceTokenController = {
  async register(req: Request, res: Response) {
    const { token } = req.body;
    const saved = await deviceTokenService.register(
      req.tenantId!,
      req.auth!.userId,
      token,
      // req.headers["user-agent"]
    );
    res.status(201).json(saved);
  },

  async unregister(req: Request, res: Response) {
    const { token } = req.body;
    await deviceTokenService.unregister(token);
    res.status(204).send();
  },
};