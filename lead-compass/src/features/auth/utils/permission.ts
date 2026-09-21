// features/auth/permission.ts
export function hasPermission(granted: string[] | undefined, required: string): boolean {
    if (!granted?.length) return false;
    if (granted.includes("*")) return true;
    return granted.some((g) => matchPermission(g, required));
}

function matchPermission(granted: string, required: string): boolean {
    const g = granted.split(":");
    const r = required.split(":");

    if (g.length > r.length) return false;

    for (let i = 0; i < g.length; i++) {
        if (g[i] === "*") return true;
        if (g[i] !== r[i]) return false;
    }
    return true;
}