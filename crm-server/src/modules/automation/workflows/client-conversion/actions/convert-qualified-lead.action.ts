import { leadService } from "../../../../lead/services/lead.service.js";
import type { ConversionState } from "../state.js";

export async function convertQualifiedLead(state: ConversionState) {
  const result = await leadService.convertQualifiedLeadAfterWonDeal(state.tenantId, state.dealId);
  if (!result.converted) {
    return { outcome: "skipped" as const, reason: result.reason };
  }
  return {
    outcome: "converted" as const,
    clientUserId: result.clientUser.id,
    projectId: result.projectId,
    alreadyConverted: result.alreadyConverted,
  };
}
