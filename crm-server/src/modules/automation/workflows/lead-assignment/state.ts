import { Annotation } from "@langchain/langgraph";
import type { Candidate, LeadAssignmentOutcome, LeadAssignmentRecommendation, LeadContext } from "./schemas.js";

export const LeadAssignmentState = Annotation.Root({
  tenantId: Annotation<string>(),
  leadId: Annotation<string>(),
  lead: Annotation<LeadContext | null>(),
  candidates: Annotation<Candidate[]>(),
  recommendation: Annotation<LeadAssignmentRecommendation | null>(),
  reviewedRecommendation: Annotation<LeadAssignmentRecommendation | null>(),
  outcome: Annotation<LeadAssignmentOutcome | null>(),
});

export type LeadAssignmentState = typeof LeadAssignmentState.State;
