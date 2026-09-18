export const dealsKeys = {
  all: ["deals"] as const,
  lists: () => [...dealsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...dealsKeys.lists(), filters] as const,
  details: () => [...dealsKeys.all, "detail"] as const,
  detail: (id: string) => [...dealsKeys.details(), id] as const,
  board: () => [...dealsKeys.all, "board"] as const,
};
