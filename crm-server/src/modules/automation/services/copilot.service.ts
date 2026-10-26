import { z } from "zod";
import { ApiError } from "../../../shared/utils/ApiError.js";
import type { AccessTokenPayload } from "../../../shared/utils/jwt.js";
import { runCopilotWorkflow } from "../workflows/copilot/workflow.js";

const copilotRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Enter a question for the CRM assistant.").max(4000),
});

export const copilotService = {
  async runCopilotCommand(
    prompt: string,
    tenantId: string,
    actor: AccessTokenPayload,
  ): Promise<{ answer: string; actionTaken?: string }> {
    const parsedPrompt = copilotRequestSchema.safeParse({ prompt });
    if (!parsedPrompt.success) {
      throw ApiError.badRequest(
        parsedPrompt.error.issues[0]?.message ?? "Enter a valid question for the CRM assistant.",
      );
    }
    const safePrompt = parsedPrompt.data.prompt;

    if (!actor || actor.tenantId !== tenantId) {
      throw ApiError.forbidden("Your CRM workspace could not be verified for this request.");
    }

    try {
      return await runCopilotWorkflow(safePrompt, actor);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        "The CRM assistant is temporarily unavailable. Please try again in a moment.",
      );
    }
  },
};
