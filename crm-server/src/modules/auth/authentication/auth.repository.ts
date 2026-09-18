import { Role } from "../../../shared/configs/role";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";

export const authRepository = {
    async findByTenant(tx: PrismaClientTx, tenantId: string, filters: { role?: string }) {
        return tx.user.findMany({
            where: {
                tenantId,
                role: {
                    in: ["SALES_REP"]
                }
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
            },
            orderBy: { full_name: "asc" },
        });
    },
}