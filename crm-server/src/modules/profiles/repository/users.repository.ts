import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { USER_SELECT } from "../profiles.util";

export const userRepository = {
    findById(tx: PrismaClientTx, tenantId: string, userId: string) {
        return tx.user.findFirst({
            where: { id: userId, tenantId },
            select: USER_SELECT,
        });
    },

    findByEmail(tx: PrismaClientTx, tenantId: string, email: string) {
        return tx.user.findFirst({
            where: { tenantId, email },
            select: { id: true },
        });
    },

    update(tx: PrismaClientTx, userId: string, data: { full_name?: string; email?: string }) {
        return tx.user.update({
            where: { id: userId },
            data,
            select: USER_SELECT,
        });
    },

    delete(tx: PrismaClientTx, userId: string) {
        return tx.user.delete({ where: { id: userId } });
    },


    //   countOwnersInTenant(tx: PrismaClientTx, tenantId: string) {
    //     return tx.user.count({ where: { tenantId, role: "OWNER" } });
    //   },
};