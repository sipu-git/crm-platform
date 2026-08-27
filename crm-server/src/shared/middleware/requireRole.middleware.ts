// src/shared/middlewares/requirePermission.ts
import { NextFunction, Request, Response } from "express";
import { hasPermission } from "../../modules/rbac/hasPermission.js";
import { ApiError } from "../utils/ApiError.js";

export function requirePermission(permission: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.auth) {
            return next(ApiError.unauthorized("Authentication required"));
        }
        if (!hasPermission(req.auth.role, permission)) {
            return next(ApiError.forbidden(`Missing permission: ${permission}`));
        }
        next();
    };
}