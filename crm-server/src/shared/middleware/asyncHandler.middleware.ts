import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    fn: (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response,
      next: NextFunction
    ) => Promise<any>
  ) =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("🔥 ERROR:", err);
    next(err);
  });
  };