import { invokeBedrockAmazon } from "../bedrock.client";

export interface AIDealHealthAnalysis {
  health_score: number;
  win_probability: number;
  risk_factors: string[];
}

export interface DealInput {
  dealName: string;
  stage: string;
  amount: number;
  daysInStage: number;
  hasOverdueInvoice: boolean;
  lastActivityDaysAgo: number;
}

export const dealHealthService = {
  /**
   * Module 4: Predictive Deal Health Analysis
   */
  async evaluateDealHealth(deal: DealInput): Promise<AIDealHealthAnalysis> {
    const systemPrompt = `You are an AI Deal Risk Analyst. Evaluate the probability of winning this deal and assign a health score (0-100).
Return STRICT JSON with:
1. "health_score": integer (0-100)
2. "win_probability": percentage integer (0-100)
3. "risk_factors": array of strings explaining any red flags

JSON format:
{
  "health_score": 75,
  "win_probability": 80,
  "risk_factors": ["Stagnant in current stage for over 14 days"]
}`;

    const prompt = `Deal: ${deal.dealName}
Stage: ${deal.stage}
Value: $${deal.amount}
Days in current stage: ${deal.daysInStage}
Last Activity: ${deal.lastActivityDaysAgo} days ago
Overdue Invoice Present: ${deal.hasOverdueInvoice ? "YES" : "NO"}`;

    const response = await invokeBedrockAmazon(prompt, systemPrompt);

    if (response.json) {
      return {
        health_score: Number(response.json.health_score ?? 70),
        win_probability: Number(response.json.win_probability ?? 65),
        risk_factors: Array.isArray(response.json.risk_factors) ? response.json.risk_factors : [],
      };
    }

    return {
      health_score: 70,
      win_probability: 60,
      risk_factors: deal.daysInStage > 10 ? ["Deal stagnant in stage"] : [],
    };
  },
};
