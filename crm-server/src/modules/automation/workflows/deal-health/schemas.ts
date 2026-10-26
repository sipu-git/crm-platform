import { z } from "zod";

export const dealInputSchema = z.object({
  dealName: z.string().trim().min(1).max(200),
  stage: z.string().trim().min(1).max(100),
  amount: z.number().finite().min(0),
  daysInStage: z.number().int().min(0).max(10000),
  hasOverdueInvoice: z.boolean(),
  lastActivityDaysAgo: z.number().int().min(0).max(10000),
});

export const dealAssessmentSchema = z.object({
  health_score: z.number().int().min(0).max(100),
  win_probability: z.number().int().min(0).max(100),
  risk_factors: z.array(z.string().trim().min(1).max(300)).max(20),
});
