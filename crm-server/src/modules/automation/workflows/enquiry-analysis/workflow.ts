import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { parseWorkflowInput } from "../parse-input.js";
import type { AIEnquiryAnalysis, EnquiryInput } from "../../services/enquiry-analysis.service.js";
import { qualifyEnquiry } from "./qualification.agent.js";
import { reviewEnquiry } from "./review.agent.js";
import { enquiryAnalysisSchema, enquiryInputSchema } from "./schemas.js";

const EnquiryState = new StateSchema({
  enquiry: enquiryInputSchema,
  draft: enquiryAnalysisSchema.optional(),
  result: enquiryAnalysisSchema.optional(),
});

const enquiryGraph = new StateGraph(EnquiryState)
  .addNode("qualificationAgent", async (state) => ({ draft: await qualifyEnquiry(state.enquiry) }))
  .addNode("reviewAgent", async (state) => {
    if (!state.draft) throw new Error("Enquiry qualification draft is missing.");
    return { result: await reviewEnquiry(state.enquiry, state.draft) };
  })
  .addEdge(START, "qualificationAgent")
  .addEdge("qualificationAgent", "reviewAgent")
  .addEdge("reviewAgent", END)
  .compile();

export async function runEnquiryAnalysisWorkflow(input: EnquiryInput): Promise<AIEnquiryAnalysis> {
  const result = await enquiryGraph.invoke({ enquiry: parseWorkflowInput(enquiryInputSchema, input) });
  if (!result.result) throw new Error("Enquiry analysis workflow returned no reviewed result.");
  return result.result;
}
