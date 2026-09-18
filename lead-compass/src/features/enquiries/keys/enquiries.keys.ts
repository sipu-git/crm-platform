export const enquiriesKeys = {
  all: ["enquiries"] as const,
  lists: () => [...enquiriesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...enquiriesKeys.lists(), filters ?? {}] as const,
  details: () => [...enquiriesKeys.all, "detail"] as const,
  detail: (id: string) => [...enquiriesKeys.details(), id] as const,
};
