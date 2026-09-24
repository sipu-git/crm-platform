// src/modules/rbac/scope.ts
import { AccessTokenPayload } from "../../shared/utils/jwt";
import { hasPermission } from "./hasPermission";

export type OwnableModule = "leads" | "deals" | "activities" | "projects" | "invoices" | "company";

const OWNER_FIELD: Record<OwnableModule, string> = {
    leads: "assigneeId",
    deals: "ownerId",
    activities: "created_by", 
    projects: "creatorId",
    invoices: "company_id",
    company: "id", // company itself is scoped by its own id matching companyId
};

export function buildOwnershipFilter(
    user: AccessTokenPayload,
    module: OwnableModule
): Record<string, unknown> {
    // Org-wide read permission (e.g. "leads:read") short-circuits to no extra filter.
    if (hasPermission(user.role, `${module}:read`)) {
        return {};
    }

    // CLIENT role is scoped by companyId or project membership.
    if (user.role === "CLIENT") {
        if (module === "invoices") {
            const conditions: Record<string, unknown>[] = [
                { project: { members: { some: { user_id: user.userId, tenant_id: user.tenantId } } } }
            ];
            if (user.companyId) {
                conditions.push({ company_id: user.companyId });
            }
            return conditions.length === 1 ? conditions[0] : { OR: conditions };
        }
        if (!user.companyId) throw new Error("CLIENT user missing companyId — cannot scope query safely");
        return { companyId: user.companyId };
    }

    // Falls through to "own" scoping (e.g. SALES_REP).
    const field = OWNER_FIELD[module];
    return { [field]: user.userId };
}

export function canAccessRecord(user: AccessTokenPayload, module: OwnableModule, record: Record<string, unknown>): boolean {
    if (hasPermission(user.role, `${module}:read`)) return true;

    if (user.role === "CLIENT") {
        if (module === "invoices") {
            return record.company_id === user.companyId || Boolean(record.project);
        }
        return record.companyId === user.companyId;
    }

    const field = OWNER_FIELD[module];
    return record[field] === user.userId;
}
