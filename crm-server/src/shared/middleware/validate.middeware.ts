import { ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

interface ValidationSchemas {
    body?: ZodSchema<any>;
    query?: ZodSchema<any>;
    params?: ZodSchema<any>;
}

export const validate =
    (schemas: ValidationSchemas) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const validated: any = {};

                if (schemas.body) {
                    validated.body = schemas.body.parse(req.body);
                }

                if (schemas.query) {
                    validated.query = schemas.query.parse(req.query ?? {});
                }

                if (schemas.params) {
                    validated.params = schemas.params.parse(req.params ?? {});
                }
                (req as any).validated = validated;

                next();
            } catch (err) {
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