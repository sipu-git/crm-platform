import { prisma } from "../../../../../../lib/prisma.js";
import { isUsableClientEmail } from "../../../../lead/services/lead.service.js";
import type { ConversionState } from "../state.js";

export async function inspectWonDeal(state: ConversionState) {
  const deal = await prisma.deal.findFirst({
    where: { id: state.dealId, tenant_id: state.tenantId },
    include: { pipeline: true, leads: { include: { contact: true } } },
  });

  if (!deal) return { outcome: "skipped" as const, reason: "Deal was not found in this tenant." };
  if (!deal.pipeline.is_won) return { outcome: "skipped" as const, reason: "Deal is no longer in a won stage." };
  if (deal.leads.status !== "QUALIFIED") {
    return { outcome: "skipped" as const, reason: "Lead is not qualified for client conversion." };
  }
  if (!isUsableClientEmail(deal.leads.contact?.email)) {
    return { outcome: "skipped" as const, reason: "Lead contact has no usable client email address." };
  }

  return { outcome: "pending" as const };
}
