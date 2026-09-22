// src/modules/rbac/permissions.ts
import { Role } from "../../shared/configs/role.js";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    SUPER_ADMIN: ["*"],
    ADMIN: ["*", "users:*"],

    MANAGER: [
        "leads:*", "leads:convert", "deals:*", "contacts:*", "company:*",
        "communications:*","enquires:*",
        "activities:*", "projects:*", "invoices:read", "audit:view",
        "notifications:read:own", "automation:respond",
        "users:manage", "users:read"
    ],

    SALES_REP: [
        "leads:read", "leads:write:own", "leads:status:update", "leads:assign:own", "leads:update",
        "deals:read", "deals:write:own", "deals:stage:read", "deals:stage:update", "deals:update",
        "activities:create", "activities:read", "activities:read:own", "activities:delete", "activities:update",
        "contacts:read", "contacts:update", "contacts:delete",
        "enquires:read","enquires:write",
        "communications:read", "communications:write",
        "company:read", "company:update",
        "invoices:read",
        "projects:read", "projects:update",
        "notifications:read:own",
        "automation:respond:own",
        "users:read"
    ],

    FINANCE: [
        "deals:read", "deals:stage:read",
        "invoices:*", "contacts:read", "deals:read",
        "company:read", "notifications:read:own",
        "users:read"
    ],

    CLIENT: [
        "invoices:read:own", "company:read:own", "company:update:own",
        "projects:read:own", "notifications:read:own",
    ],
};
