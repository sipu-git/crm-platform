import { ApiError } from '../utils/ApiError.js';
export function tenantContext(req, _res, next) {
    if (!req.auth?.tenantId) {
        return next(ApiError.unauthorized('Missing tenant context'));
    }
    req.tenantId = req.auth.tenantId;
    next();
}
