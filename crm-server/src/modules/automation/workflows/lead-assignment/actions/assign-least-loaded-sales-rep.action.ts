import { prisma } from "../../../../../../lib/prisma.js";
import { assigneeService } from "../../../../lead/services/assign.service.js";
import type { LeadAssignmentOutcome } from "../schemas.js";
import type { LeadAssignmentState } from "../state.js";

export async function assignLeastLoadedSalesRep(state: LeadAssignmentState) {
  if (!state.reviewedRecommendation) throw new Error("Reviewed recommendation is missing before assignment.");
  if (state.candidates.length === 0) throw new Error("Eligible sales rep candidates are missing before assignment.");
  const selectedRep = [...state.candidates].sort((left, right) =>
    left.activeLeadCount - right.activeLeadCount || left.userId.localeCompare(right.userId),
  )[0];

  try {
    await assigneeService.create(state.tenantId, state.leadId, { userId: selectedRep.userId });
    return {
      outcome: {
        status: "assigned",
        tenantId: state.tenantId,
        leadId: state.leadId,
        assignedUserId: selectedRep.userId,
        recommendation: state.reviewedRecommendation,
      } satisfies LeadAssignmentOutcome,
    };
  } catch (error) {
    const currentLead = await prisma.leads.findFirst({
      where: { id: state.leadId, tenant_id: state.tenantId },
      select: { assigned_to: true },
    });
    if (currentLead?.assigned_to) {
      return {
        outcome: {
          status: "skipped",
          tenantId: state.tenantId,
          leadId: state.leadId,
          reason: "already_assigned",
          recommendation: state.reviewedRecommendation,
        } satisfies LeadAssignmentOutcome,
      };
    }
    throw error;
  }
}
