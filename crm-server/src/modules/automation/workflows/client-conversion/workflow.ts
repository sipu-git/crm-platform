import { END, START, StateGraph } from "@langchain/langgraph";
import { convertQualifiedLead } from "./actions/convert-qualified-lead.action.js";
import { inspectWonDeal } from "./steps/inspect-won-deal.step.js";
import { conversionState, wonDealEventSchema } from "./state.js";

const clientConversionGraph = new StateGraph(conversionState)
  .addNode("inspectWonDeal", inspectWonDeal)
  .addNode("convertQualifiedLead", convertQualifiedLead)
  .addEdge(START, "inspectWonDeal")
  .addConditionalEdges("inspectWonDeal", (state) => state.outcome === "pending" ? "convertQualifiedLead" : END)
  .addEdge("convertQualifiedLead", END)
  .compile();

export async function runClientConversionWorkflow(input: unknown) {
  const event = wonDealEventSchema.parse(input);
  const result = await clientConversionGraph.invoke(event);
  return {
    outcome: result.outcome as "skipped" | "converted",
    reason: result.reason,
    clientUserId: result.clientUserId,
    projectId: result.projectId,
    alreadyConverted: result.alreadyConverted,
  };
}
