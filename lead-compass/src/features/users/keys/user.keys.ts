export const usersKeys = {
    all: ["users"] as const,
    lists: () => [...usersKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...usersKeys.lists(), filters ?? {}] as const,
    details: () => [...usersKeys.all, "detail"] as const,
    detail: (id: string) => [...usersKeys.details(), id] as const,
    invites: () => [...usersKeys.all, "invites"] as const,
};