import { z } from "zod";

export const enquiryInputSchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  project_name: z.string().max(200).nullable().optional(),
  project_type: z.string().max(100).nullable().optional(),
  budget: z.string().max(200).nullable().optional(),
  timeline: z.string().max(200).nullable().optional(),
  description: z.string().max(8000).nullable().optional(),
});

export const enquiryAnalysisSchema = z.object({
  ai_score: z.number().int().min(0).max(100),
  ai_intent: z.enum(["HIGH_INTENT", "MEDIUM_INTENT", "LOW_INTENT", "SPAM"]),
  ai_summary: z.string().trim().min(1).max(600),
  ai_suggested_action: z.string().trim().min(1).max(300),
});
