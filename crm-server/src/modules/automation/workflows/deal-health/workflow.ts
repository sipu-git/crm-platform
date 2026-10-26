import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { parseWorkflowInput } from "../parse-input.js";
import type { AIDealHealthAnalysis, DealInput } from "../../services/deal-health.service.js";
import { assessCommercialHealth } from "./commercial-analyst.agent.js";
import { reconcileAssessments } from "./reconcile-assessments.step.js";
import { reviewDealRisks } from "./risk-reviewer.agent.js";
import { dealAssessmentSchema, dealInputSchema } from "./schemas.js";

const DealHealthState = new StateSchema({
  deal: dealInputSchema,
  commercialAssessment: dealAssessmentSchema.optional(),
  riskAssessment: dealAssessmentSchema.optional(),
  result: dealAssessmentSchema.optional(),
});

const dealHealthGraph = new StateGraph(DealHealthState)
  .addNode("commercialAnalyst", async (state) => ({ commercialAssessment: await assessCommercialHealth(state.deal) }))
  .addNode("riskReviewer", async (state) => ({ riskAssessment: await reviewDealRisks(state.deal) }))
  .addNode("reconcile", (state) => ({ result: reconcileAssessments(state.commercialAssessment, state.riskAssessment) }))
  .addEdge(START, "commercialAnalyst")
  .addEdge(START, "riskReviewer")
  .addEdge(["commercialAnalyst", "riskReviewer"], "reconcile")
  .addEdge("reconcile", END)
  .compile();

export async function runDealHealthWorkflow(input: DealInput): Promise<AIDealHealthAnalysis> {
  const result = await dealHealthGraph.invoke({ deal: parseWorkflowInput(dealInputSchema, input) });
  if (!result.result) throw new Error("Deal health workflow returned no reconciled assessment.");
  return result.result;
}
