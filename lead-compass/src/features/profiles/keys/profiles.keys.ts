export const profilesKeys = {
  all: ["profile"] as const,
  lists: () => [...profilesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...profilesKeys.lists(), filters] as const,
  details: () => [...profilesKeys.all, "detail"] as const,
  detail: (id: string) => [...profilesKeys.details(), id] as const,
  current: () => [...profilesKeys.all, "current"] as const,
};
