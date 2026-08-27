// src/modules/rbac/permissions.ts
import { Role } from "../../shared/configs/role.js";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    ADMIN: ["*", "users:*"],

    MANAGER: [
        "leads:*", "deals:*", "contacts:*", "company:*",
        "communications:*",
        "activities:*", "projects:*", "invoices:read", "audit:view",
        "notifications:read:own", "automation:respond",
        "users:manage", "users:read"
    ],

    SALES_REP: [
        "leads:read", "leads:write:own", "leads:status:update", "leads:assign:own", "leads:update",
        "deals:read", "deals:write:own", "deals:stage:read", "deals:stage:update", "deals:update",
        "activities:create", "activities:read:own", "activities:delete", "activities:update",
        "contacts:read", "contacts:update", "contacts:delete",
        "communications:read", "communications:write",
        "company:read", "company:update",
        "invoices:read",
        "projects:read", "projects:update",
        "notifications:read:own",
        "automation:respond:own",
        "users:read"
    ],

    FINANCE: [
        "deals:read","deals:stage:read",
        "invoices:*", "contacts:read", "deals:read",
        "projects:read", "company:read", "notifications:read:own",
    ],

    CLIENT: [
        "leads:read:own", "deals:read:own", "contacts:read",
        "invoices:read:own_company",
        "projects:read:own_company", "projects:write:own_company",
        "company:read:own_company", "notifications:read:own",
    ],
};