import { runDealHealthWorkflow } from "../workflows/deal-health/workflow.js";

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
  async evaluateDealHealth(deal: DealInput): Promise<AIDealHealthAnalysis> {
    return runDealHealthWorkflow(deal);
  },
};
