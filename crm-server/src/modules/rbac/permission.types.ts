import { Role } from "../../shared/configs/role";

export interface AuthUser {
    id: string;
    tenantId: string;
    role: Role;
    companyId?: string | null;
}