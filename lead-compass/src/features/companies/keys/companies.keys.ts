export const companiesKeys = {
  all: ["companies"] as const,
  lists: () => [...companiesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...companiesKeys.lists(), filters] as const,
  details: () => [...companiesKeys.all, "detail"] as const,
  detail: (id: string) => [...companiesKeys.details(), id] as const,
  own: () => [...companiesKeys.all, "own"] as const,
};
