export const projectsKeys = {
  all: ["projects"] as const,
  lists: () => [...projectsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...projectsKeys.lists(), filters] as const,
  ownLists: () => [...projectsKeys.all, "own-list"] as const,
  own: (filters?: Record<string, unknown>) => [...projectsKeys.ownLists(), filters] as const,
  details: () => [...projectsKeys.all, "detail"] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
  ownKey: (filters?: Record<string, unknown>) => ["own", filters] as const,
};
