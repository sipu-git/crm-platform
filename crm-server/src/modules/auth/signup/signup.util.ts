import crypto from "crypto";

export const RESERVED_SLUGS = [
  'admin', 'administrator', 'api', 'app', 'auth', 'billing', 'calendar', 'dashboard',
  'docs', 'help', 'login', 'logout', 'recovery', 'register', 'root', 'settings',
  'signup', 'support', 'system', 'user', 'users', 'workspace', 'workspaces'
];

export function generateTenantKey(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "";

    for (let i = 0; i < 10; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        key += characters[randomIndex];
    }

    return key;
}