import { END, START, StateGraph } from "@langchain/langgraph";
import { analyzeLead } from "./agents/analyze-lead.agent.js";
import { reviewLeadRecommendation } from "./agents/review-lead-recommendation.agent.js";
import { assignLeastLoadedSalesRep } from "./actions/assign-least-loaded-sales-rep.action.js";
import { loadAssignmentContext } from "./steps/load-assignment-context.step.js";
import { LeadAssignmentState } from "./state.js";
import type { LeadAssignmentOutcome } from "./schemas.js";

const leadAssignmentGraph = new StateGraph(LeadAssignmentState)
  .addNode("loadContext", loadAssignmentContext)
  .addNode("analyzeLead", analyzeLead)
  .addNode("reviewRecommendation", reviewLeadRecommendation)
  .addNode("assignRep", assignLeastLoadedSalesRep)
  .addEdge(START, "loadContext")
  .addConditionalEdges("loadContext", (state) => state.outcome ? END : "analyzeLead")
  .addEdge("analyzeLead", "reviewRecommendation")
  .addEdge("reviewRecommendation", "assignRep")
  .addEdge("assignRep", END)
  .compile();

export async function runLeadAssignmentWorkflow(input: { tenantId: string; leadId: string }): Promise<LeadAssignmentOutcome> {
  const result = await leadAssignmentGraph.invoke({
    tenantId: input.tenantId,
    leadId: input.leadId,
    lead: null,
    candidates: [],
    recommendation: null,
    reviewedRecommendation: null,
    outcome: null,
  });
  if (!result.outcome) throw new Error(`Lead assignment workflow ended without an outcome for lead ${input.leadId}.`);
  return result.outcome;
}
