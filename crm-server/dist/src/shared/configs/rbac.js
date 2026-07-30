import { ApiError } from '../utils/ApiError';
export function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.auth)
            return next(ApiError.unauthorized());
        if (!allowedRoles.includes(req.auth.role)) {
            return next(ApiError.forbidden(`Requires one of roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
}
