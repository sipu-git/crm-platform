import type { AISummaryResult } from "../../services/communication-summary.service.js";
import type { conversationSummarySchema, followUpPlanSchema } from "./schemas.js";
import { z } from "zod";

type Summary = z.infer<typeof conversationSummarySchema>;
type FollowUpPlan = z.infer<typeof followUpPlanSchema>;

export function mergeSummaryAndFollowUps(summary?: Summary, actions?: FollowUpPlan): AISummaryResult {
  if (!summary || !actions) throw new Error("Conversation agents did not return both analysis results.");
  return {
    summary: summary.summary,
    objections: summary.objections,
    action_items: actions.action_items,
  };
}
