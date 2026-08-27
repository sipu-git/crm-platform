import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { CreateDealInput, UpdateStageInput } from "../deal.schema";

export const dealRepository = {
  findMany(tx: PrismaClientTx, tenantId: string, ownerId?: string) {
    return tx.deal.findMany({
      where: { tenant_id: tenantId, ...(ownerId ? { owner_id: ownerId } : {}) },
      include: {
        contact: true, pipeline: true,
        owner: {
          select: {
            id: true,
            full_name: true,
          },
        },
        leads: {
          include: {
            assignee: true,
          }
        }
      },
      orderBy: {
        created_at: "desc"
      },
    });
  },

  findById(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.deal.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        contact: true, pipeline: true, owner: {
          select: {
            id: true,
            full_name: true,
          }
        },
        leads: {
          include: {
            assignee: true,
          }
        }

      },
    });
  },

  create(tx: PrismaClientTx, tenantId: string, ownerId: string, data: CreateDealInput) {
    return tx.deal.create({
      data: {
        tenant_id: tenantId,
        owner_id: ownerId,
        title: data.title,
        amount: data.amount,
        lead_id: data.leadId,
        contact_id: data.contactId,
        stage_id: data.stageId,
        expected_close_date: data.expectedCloseDate,
      },
    });
  },

  findGroupedByStage(tx: PrismaClientTx, tenantId: string) {
    return tx.pipeline.findMany({
      where: { tenant_id: tenantId },
      orderBy: { sort_order: "asc" },
      include: {
        deals: {
          where: { tenant_id: tenantId },
          include: {
            contact: { select: { first_name: true, last_name: true } },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });
  },

  moveStage(tx: PrismaClientTx, tenantId: string, dealId: string, stageId: string) {
    return tx.deal.updateMany({
      where: {
        id: dealId,
        tenant_id: tenantId
      },
      data: {
        stage_id: stageId
      }
    })
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
        tenant_id: tenantId
      }
    })
  }
}