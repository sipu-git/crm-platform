import { PrismaClientTx } from "../../../shared/utils/prisma.types.js";
import { CreateDealInput, UpdateStageInput } from "../deal.schema.js";
import { getEnquiryBudgetForLead } from "../utils/enquiryBudget.util.js";

export const dealRepository = {
  findByLead(tx: PrismaClientTx, tenantId: string, leadId: string) {
    return tx.deal.findFirst({ where: { tenant_id: tenantId, lead_id: leadId } });
  },

  async findMany(tx: PrismaClientTx, tenantId: string, ownerId?: string) {
    const deals = await tx.deal.findMany({
      where: { tenant_id: tenantId, ...(ownerId ? { owner_id: ownerId } : {}) },
      include: {
        contact: true,
        pipeline: true,
        owner: {
          select: {
            id: true, full_name: true,
          },
        },
        leads: {
          include: {
            assignee: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    for (const deal of deals) {
      if (Number(deal.amount) === 0 && deal.lead_id) {
        const budgetDecimal = await getEnquiryBudgetForLead(tx, tenantId, deal.lead_id);
        if (budgetDecimal && budgetDecimal.toNumber() > 0) {
          deal.amount = budgetDecimal as any;
          await tx.deal.update({
            where: { id: deal.id },
            data: { amount: budgetDecimal },
          }).catch(() => { });
        }
      }
    }

    return deals;
  },

  async findById(tx: PrismaClientTx, tenantId: string, id: string) {
    const deal = await tx.deal.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        contact: true,
        pipeline: true,
        owner: {
          select: {
            id: true,
            full_name: true,
          },
        },
        leads: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (deal && Number(deal.amount) === 0 && deal.lead_id) {
      const budgetDecimal = await getEnquiryBudgetForLead(tx, tenantId, deal.lead_id);
      if (budgetDecimal && budgetDecimal.toNumber() > 0) {
        deal.amount = budgetDecimal as any;
        await tx.deal.update({
          where: { id: deal.id },
          data: { amount: budgetDecimal },
        }).catch(() => { });
      }
    }

    return deal;
  },

  async create(tx: PrismaClientTx, tenantId: string, ownerId: string, data: CreateDealInput) {
    let initialAmount = data.amount;
    if (!initialAmount || initialAmount === 0) {
      const enquiryAmount = await getEnquiryBudgetForLead(tx, tenantId, data.leadId);
      if (enquiryAmount) {
        initialAmount = enquiryAmount.toNumber();
      }
    }

    return tx.deal.create({
      data: {
        tenant_id: tenantId,
        owner_id: ownerId,
        title: data.title,
        amount: initialAmount ?? 0,
        lead_id: data.leadId,
        contact_id: data.contactId,
        stage_id: data.stageId,
        expected_close_date: data.expectedCloseDate,
      },
    });
  },

  async findGroupedByStage(tx: PrismaClientTx, tenantId: string) {
    const pipelineStages = await tx.pipeline.findMany({
      where: { tenant_id: tenantId },
      orderBy: { sort_order: "asc" },
      include: {
        deals: {
          where: { tenant_id: tenantId },
          include: {
            contact: { select: { first_name: true, last_name: true } },
            leads: { select: { id: true, company_name: true } },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    for (const stage of pipelineStages) {
      for (const deal of stage.deals) {
        if (Number(deal.amount) === 0 && deal.lead_id) {
          const budgetDecimal = await getEnquiryBudgetForLead(tx, tenantId, deal.lead_id);
          if (budgetDecimal && budgetDecimal.toNumber() > 0) {
            deal.amount = budgetDecimal as any;
            await tx.deal.update({
              where: { id: deal.id },
              data: { amount: budgetDecimal },
            }).catch(() => { });
          }
        }
      }
    }

    return pipelineStages;
  },

  moveStage(tx: PrismaClientTx, tenantId: string, dealId: string, stageId: string) {
    return tx.deal.updateMany({
      where: {
        id: dealId,
        tenant_id: tenantId,
      },
      data: {
        stage_id: stageId,
      },
    });
  },

  async update(tx: PrismaClientTx, tenantId: string, dealId: string, data: UpdateStageInput) {
    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.contactId !== undefined) updateData.contact_id = data.contactId;
    if (data.leadId !== undefined) updateData.lead_id = data.leadId;
    if (data.stageId !== undefined) updateData.stage_id = data.stageId;
    if (data.expectedCloseDate !== undefined) updateData.expected_close_date = data.expectedCloseDate;

    await tx.deal.updateMany({
      where: {
        id: dealId,
        tenant_id: tenantId,
      },
      data: updateData,
    });

    return this.findById(tx, tenantId, dealId);
  },

  delete(tx: PrismaClientTx, tenantId: string, dealId: string) {
    return tx.deal.deleteMany({
      where: {
        id: dealId,
        tenant_id: tenantId,
      },
    });
  },
};
