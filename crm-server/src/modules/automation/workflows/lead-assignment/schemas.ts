import { z } from "zod";

export const leadAssignmentRecommendationSchema = z.object({
  priority: z.enum(["LOW", "NORMAL", "HIGH"]),
  segment: z.enum(["SMB", "MID_MARKET", "ENTERPRISE", "UNKNOWN"]),
  recommendedSkills: z.array(z.string().trim().min(1).max(64)).max(5),
  rationale: z.string().trim().min(1).max(500),
});

export type LeadAssignmentRecommendation = z.infer<typeof leadAssignmentRecommendationSchema>;
export type LeadAssignmentOutcome =
  | { status: "assigned"; tenantId: string; leadId: string; assignedUserId: string; recommendation: LeadAssignmentRecommendation }
  | { status: "skipped"; tenantId: string; leadId: string; reason: "already_assigned" | "no_eligible_sales_reps" | "lead_not_assignable"; recommendation?: LeadAssignmentRecommendation };
export type LeadContext = {
  companyName: string;
  projectName: string | null;
  projectType: string | null;
  industry: string | null;
  companySize: string | null;
  relatedProjectStatuses: string[];
};
export type Candidate = { userId: string; activeLeadCount: number };
