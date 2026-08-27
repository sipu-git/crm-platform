import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            resetUser?: {
                userId: string;
                email: string;
            };
        }
    }
}

const JWT_SECRET = process.env.JWT_ACCESS_SECRET_KEY!;

export const resetTokenMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Reset token is required',
            });
        }

        const resetToken = authHeader.split(' ')[1];
        const decoded = jwt.verify(resetToken, JWT_SECRET) as {
            userId: string;
            email: string;
        };

        req.resetUser = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired reset token',
        });
    }
};