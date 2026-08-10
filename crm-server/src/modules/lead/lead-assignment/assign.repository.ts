import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { CreateAssignInputs } from "./assign.schema";

export const assignRepository = {
  create(tx: PrismaClientTx, tenantId: string, data: CreateAssignInputs) {
    return tx.assignee.create({
      data: {
        tenant_id: tenantId,
        full_name: data.full_name,
        designation: data.designation,
        department: data.department,
        userId: data.userId ?? null,
      }
    })
  },

  viewAssignee(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.assignee.findFirst({
      where: {
        id, tenant_id: tenantId
      },
      include:{
        leads:true
      },
    })
  },
  findAllByTenant(tx: PrismaClientTx, tenantId: string) {
    return tx.assignee.findMany({
      where: { tenant_id: tenantId },
      orderBy: { full_name: "asc" },
      include:{
        leads:true
      },
    });
  },
}