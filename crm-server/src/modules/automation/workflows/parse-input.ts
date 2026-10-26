import { z } from "zod";
import { ApiError } from "../../../shared/utils/ApiError.js";

/** Turns workflow input validation failures into readable API 400 responses. */
export function parseWorkflowInput<Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "The supplied workflow input is invalid.";
    throw ApiError.badRequest(message);
  }
  return result.data;
}
