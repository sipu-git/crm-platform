import { api } from "@/api/client";

type Envelope<T> = { data: T };
const payload = <T,>(response: { data: Envelope<T> }) => response.data.data;

export interface AIEnquiryAnalysis {
  ai_score: number;
  ai_intent: "HIGH_INTENT" | "MEDIUM_INTENT" | "LOW_INTENT" | "SPAM";
  ai_summary: string;
  ai_suggested_action: string;
}

export interface AIEmailDraft {
  subject: string;
  body: string;
}

export interface AISummaryResult {
  summary: string;
  objections: string[];
  action_items: Array<{ title: string; priority: "HIGH" | "MEDIUM" | "LOW" }>;
}

export interface AIDealHealthAnalysis {
  health_score: number;
  win_probability: number;
  risk_factors: string[];
}

export interface AICopilotResult {
  answer: string;
  actionTaken?: string;
}

export const aiApi = {
  /**
   * Module 1: Analyze Lead Enquiry
   */
  async analyzeEnquiry(data: {
    company_name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    project_name?: string;
    project_type?: string;
    budget?: string;
    timeline?: string;
    description?: string;
  }): Promise<AIEnquiryAnalysis> {
    return payload(await api.post<Envelope<AIEnquiryAnalysis>>("/ai/analyze-enquiry", data));
  },

  /**
   * Module 2: Generate Follow-Up Email Draft
   */
  async generateEmailDraft(data: {
    clientName: string;
    companyName: string;
    lastInteraction?: string;
    purpose?: string;
    tone?: "professional" | "persuasive" | "friendly";
  }): Promise<AIEmailDraft> {
    return payload(await api.post<Envelope<AIEmailDraft>>("/ai/generate-email", data));
  },

  /**
   * Module 3: Summarize Communication Thread
   */
  async summarizeCommunications(data: {
    messages: Array<{ sender: string; text: string; date?: string }>;
  }): Promise<AISummaryResult> {
    return payload(await api.post<Envelope<AISummaryResult>>("/ai/summarize", data));
  },

  /**
   * Module 4: Evaluate Deal Health
   */
  async evaluateDealHealth(data: {
    dealName: string;
    stage: string;
    amount: number;
    daysInStage: number;
    hasOverdueInvoice: boolean;
    lastActivityDaysAgo: number;
  }): Promise<AIDealHealthAnalysis> {
    return payload(await api.post<Envelope<AIDealHealthAnalysis>>("/ai/deal-health", data));
  },

  /**
   * Module 5: Run AI Co-Pilot Command
   */
  async copilot(data: { prompt: string }): Promise<AICopilotResult> {
    return payload(await api.post<Envelope<AICopilotResult>>("/ai/copilot", data));
  },
};
