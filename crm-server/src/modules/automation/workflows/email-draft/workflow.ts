import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { parseWorkflowInput } from "../parse-input.js";
import type { AIEmailDraft, EmailDraftInput } from "../../services/email-draft.service.js";
import { reviewSalesEmail } from "./email-editor.agent.js";
import { writeSalesEmail } from "./sales-writer.agent.js";
import { emailContextSchema, emailDraftSchema } from "./schemas.js";

const EmailDraftState = new StateSchema({
  context: emailContextSchema,
  draft: emailDraftSchema.optional(),
  reviewedDraft: emailDraftSchema.optional(),
});

const emailDraftGraph = new StateGraph(EmailDraftState)
  .addNode("salesWriter", async (state) => ({ draft: await writeSalesEmail(state.context) }))
  .addNode("emailEditor", async (state) => {
    if (!state.draft) throw new Error("Email writer did not return a draft.");
    return { reviewedDraft: await reviewSalesEmail(state.context, state.draft) };
  })
  .addEdge(START, "salesWriter")
  .addEdge("salesWriter", "emailEditor")
  .addEdge("emailEditor", END)
  .compile();

export async function runEmailDraftWorkflow(input: EmailDraftInput): Promise<AIEmailDraft> {
  const result = await emailDraftGraph.invoke({ context: parseWorkflowInput(emailContextSchema, input) });
  if (!result.reviewedDraft) throw new Error("Email draft workflow returned no reviewed draft.");
  return result.reviewedDraft;
}
