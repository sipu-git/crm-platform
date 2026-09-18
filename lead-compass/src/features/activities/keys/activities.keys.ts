export const activitiesKeys = {
    all: ["activities"] as const,
    lists: () => [...activitiesKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...activitiesKeys.lists(), filters] as const,
    details: () => [...activitiesKeys.all, "detail"] as const,
    detail: (id: string) => [...activitiesKeys.details(), id] as const,
    own: () => [...activitiesKeys.all, "own"] as const,
};