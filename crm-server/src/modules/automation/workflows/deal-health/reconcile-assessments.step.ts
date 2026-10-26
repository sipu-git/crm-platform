import type { AIDealHealthAnalysis } from "../../services/deal-health.service.js";
import type { dealAssessmentSchema } from "./schemas.js";
import { z } from "zod";

type Assessment = z.infer<typeof dealAssessmentSchema>;

export function reconcileAssessments(commercial?: Assessment, risk?: Assessment): AIDealHealthAnalysis {
  if (!commercial || !risk) throw new Error("Deal health agents did not return both assessments.");
  return {
    health_score: Math.round((commercial.health_score + risk.health_score) / 2),
    win_probability: Math.round((commercial.win_probability + risk.win_probability) / 2),
    risk_factors: [...new Set([...risk.risk_factors, ...commercial.risk_factors])].slice(0, 20),
  };
}
