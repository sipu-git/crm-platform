// src/modules/rbac/hasPermission.ts
import { Role } from "../../shared/configs/role";
import { ROLE_PERMISSIONS } from "./permissions";

export function hasPermission(role: Role, required: string): boolean {
    const granted = ROLE_PERMISSIONS[role];
    if (!granted) return false;
    if (granted.includes("*")) return true;

    return granted.some((g) => matchPermission(g, required));
}


function matchPermission(granted: string, required: string): boolean {
    const g = granted.split(":");
    const r = required.split(":");

    for (let i = 0; i < g.length; i++) {
        if (g[i] === "*") {
            return true;
        }
        if (g[i] !== r[i]) return false;
    }
    return g.length >= r.length;
}

/** Throws-friendly variant for use inside services. */
export function assertPermission(role: Role, required: string): void {
    if (!hasPermission(role, required)) {
        const err = new Error(`Forbidden: role ${role} lacks permission ${required}`);
        (err as any).statusCode = 403;
        throw err;
    }
}