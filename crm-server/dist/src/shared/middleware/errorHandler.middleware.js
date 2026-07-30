import { ApiError } from '../utils/ApiError.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, req, res, _next) {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.message,
        });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}
