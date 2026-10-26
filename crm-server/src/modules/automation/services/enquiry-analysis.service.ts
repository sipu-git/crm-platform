import { runEnquiryAnalysisWorkflow } from "../workflows/enquiry-analysis/workflow.js";

export interface AIEnquiryAnalysis {
  ai_score: number;
  ai_intent: "HIGH_INTENT" | "MEDIUM_INTENT" | "LOW_INTENT" | "SPAM";
  ai_summary: string;
  ai_suggested_action: string;
}

export interface EnquiryInput {
  company_name: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  project_name?: string | null;
  project_type?: string | null;
  budget?: string | null;
  timeline?: string | null;
  description?: string | null;
}

export async function analyzeEnquiry(enquiry: EnquiryInput): Promise<AIEnquiryAnalysis> {
  return runEnquiryAnalysisWorkflow(enquiry);
}

export const enquiryAnalysisService = {
  analyzeEnquiry,
};
