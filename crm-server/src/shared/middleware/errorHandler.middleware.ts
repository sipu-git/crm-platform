import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error(`[ApiError ${err.statusCode}]:`, err);
    }
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.message,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
