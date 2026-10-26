import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { parseWorkflowInput } from "../parse-input.js";
import type { AISummaryResult, MessageInput } from "../../services/communication-summary.service.js";
import { analyzeConversation } from "./conversation-analyst.agent.js";
import { planFollowUps } from "./follow-up-planner.agent.js";
import { mergeSummaryAndFollowUps } from "./merge-results.step.js";
import { conversationSummarySchema, followUpPlanSchema, messagesSchema } from "./schemas.js";

const SummaryState = new StateSchema({
  messages: messagesSchema,
  summary: conversationSummarySchema.optional(),
  actions: followUpPlanSchema.optional(),
  result: conversationSummarySchema.extend({ action_items: followUpPlanSchema.shape.action_items }).optional(),
});

const communicationSummaryGraph = new StateGraph(SummaryState)
  .addNode("conversationAnalyst", async (state) => ({ summary: await analyzeConversation(state.messages) }))
  .addNode("followUpPlanner", async (state) => ({ actions: await planFollowUps(state.messages) }))
  .addNode("mergeResults", (state) => ({ result: mergeSummaryAndFollowUps(state.summary, state.actions) }))
  .addEdge(START, "conversationAnalyst")
  .addEdge(START, "followUpPlanner")
  .addEdge(["conversationAnalyst", "followUpPlanner"], "mergeResults")
  .addEdge("mergeResults", END)
  .compile();

export async function runCommunicationSummaryWorkflow(messages: MessageInput[]): Promise<AISummaryResult> {
  const result = await communicationSummaryGraph.invoke({ messages: parseWorkflowInput(messagesSchema, messages) });
  if (!result.result) throw new Error("Communication summary workflow returned no result.");
  return result.result;
}
