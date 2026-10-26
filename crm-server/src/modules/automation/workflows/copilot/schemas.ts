import { z } from "zod";

export const copilotAnswerSchema = z.object({ answer: z.string().trim().min(1).max(6000) });
