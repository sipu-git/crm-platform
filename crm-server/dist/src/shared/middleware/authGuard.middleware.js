import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
export function authGuard(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next(ApiError.unauthorized('Missing access token'));
    }
    const token = header.replace('Bearer ', '');
    try {
        req.auth = verifyAccessToken(token);
        next();
    }
    catch {
        next(ApiError.unauthorized('Invalid or expired access token'));
    }
}
