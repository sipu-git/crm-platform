import { invokeBedrockAmazon } from "../bedrock.client";

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
  const systemPrompt = `You are an expert CRM Lead Qualification AI. Analyze the incoming public lead enquiry and produce a strict JSON response containing:
1. "ai_score": integer from 0 to 100 based on budget, clarity of requirements, timeline, and company legitimacy.
2. "ai_intent": one of ["HIGH_INTENT", "MEDIUM_INTENT", "LOW_INTENT", "SPAM"].
3. "ai_summary": concise 2-sentence summary of client requirements.
4. "ai_suggested_action": 1 recommended next step for the sales rep.

Respond ONLY with valid JSON matching this format:
{
  "ai_score": 85,
  "ai_intent": "HIGH_INTENT",
  "ai_summary": "Client needs a Web Application built within 5 months with a budget of $50,000.",
  "ai_suggested_action": "Schedule technical discovery call within 24 hours."
}`;

  const prompt = `Enquiry Data:
Company: ${enquiry.company_name}
Contact: ${enquiry.first_name || ""} ${enquiry.last_name || ""} (${enquiry.email || "N/A"})
Project: ${enquiry.project_name || "N/A"} (Type: ${enquiry.project_type || "N/A"})
Budget: ${enquiry.budget || "Unspecified"}
Timeline: ${enquiry.timeline || "Unspecified"}
Description: ${enquiry.description || "No description provided"}`;

  const response = await invokeBedrockAmazon(prompt, systemPrompt);

  if (response.json) {
    return {
      ai_score: Number(response.json.ai_score ?? 50),
      ai_intent: response.json.ai_intent || "MEDIUM_INTENT",
      ai_summary: response.json.ai_summary || "Enquiry submitted.",
      ai_suggested_action: response.json.ai_suggested_action || "Review enquiry details.",
    };
  }

  return {
    ai_score: 50,
    ai_intent: "MEDIUM_INTENT",
    ai_summary: "Enquiry submitted for review.",
    ai_suggested_action: "Contact client to clarify project scope.",
  };
}

export const enquiryAnalysisService = {
  analyzeEnquiry,
};