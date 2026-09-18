import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { parseBudgetToDecimal } from "../../projects/utils/parseBudgets";
import { Prisma } from "../../../../generated/prisma/client";

export async function getEnquiryBudgetForLead(tx: PrismaClientTx,tenantId: string,leadId: string): Promise<Prisma.Decimal | null> {
  if (!leadId) return null;

  // 1. Try finding via Project -> Enquiry link
  const projectWithEnquiry = await tx.project.findFirst({
    where: { tenant_id: tenantId, originating_lead_id: leadId },
    select: { enquiry: { select: { budget: true } } },
  });

  if (projectWithEnquiry?.enquiry?.budget) {
    const dec = parseBudgetToDecimal(projectWithEnquiry.enquiry.budget);
    if (dec && dec.toNumber() > 0) return dec;
  }

  // 2. Try finding via Lead -> Company/Contact match on Enquiry
  const lead = await tx.leads.findFirst({
    where: { tenant_id: tenantId, id: leadId },
    include: { contact: true },
  });

  if (lead) {
    const enquiry = await tx.enquiry.findFirst({
      where: {
        OR: [
          ...(lead.contact?.email ? [{ email: lead.contact.email }] : []),
          ...(lead.company_name ? [{ company_name: lead.company_name }] : []),
        ],
      },
      select: { budget: true },
      orderBy: { created_at: "desc" },
    });

    if (enquiry?.budget) {
      const dec = parseBudgetToDecimal(enquiry.budget);
      if (dec && dec.toNumber() > 0) return dec;
    }
  }

  return null;
}

