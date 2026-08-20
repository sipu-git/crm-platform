import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { TENANT_SELECT } from "../profiles.util";

export const tenantProfileRepository = {
    findById(tx: PrismaClientTx, tenantId: string) {
        return tx.tenant.findUnique({
            where: { id: tenantId },
            select: TENANT_SELECT,
        });
    },

    update(tx: PrismaClientTx, tenantId: string, data: Record<string, unknown>) {
        return tx.tenant.update({
            where: { id: tenantId },
            data,
            select: TENANT_SELECT,
        });
    },
};