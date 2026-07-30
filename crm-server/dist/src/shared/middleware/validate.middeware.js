import { ZodError } from "zod";
export const validate = (schemas) => (req, res, next) => {
    try {
        const validated = {};
        if (schemas.body) {
            validated.body = schemas.body.parse(req.body);
        }
        if (schemas.query) {
            validated.query = schemas.query.parse(req.query ?? {});
        }
        if (schemas.params) {
            validated.params = schemas.params.parse(req.params ?? {});
        }
        req.validated = validated;
        next();
    }
    catch (err) {
        // Pass the error to the global error handler
        if (err instanceof ZodError) {
            const errors = err.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        return res.status(500).json({
            success: false,
            message: err instanceof Error ? err.message : "Something went wrong",
        });
    }
};
