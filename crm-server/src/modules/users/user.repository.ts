import { Role } from "../../shared/configs/role";
import { PrismaClientTx } from "../../shared/utils/prisma.types";
import { RegisterInput } from "../auth/authentication/auth.schema";

export const userRepository = {
    findByEmail(tx: PrismaClientTx, email: string) {
        return tx.user.findFirst({
            where: { email },
        });
    },
    
    createClient(tx: PrismaClientTx, tenantId: string, companyId: string, data: RegisterInput) {
        return tx.user.create({
            data: {
                tenantId,
                email: data.email,
                full_name: data.full_name,
                company_name: data.company_name,
                company_id: companyId,
                password: data.password,
                mobile: data.mobile,
                role: Role.CLIENT,
                created_at: new Date(),
            },
        });
    }
}
