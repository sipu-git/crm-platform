// src/features/auth/keys/auth.keys.ts
export const authKeys = {
    me: ["auth", "me"] as const,
    users: ["auth", "users"] as const,
    login: ["auth", "login"] as const,
    logout: ["auth", "logout"] as const,
    refresh: ["auth", "refresh"] as const,
};