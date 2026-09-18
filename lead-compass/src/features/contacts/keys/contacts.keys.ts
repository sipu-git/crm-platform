export const contactsKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...contactsKeys.lists(), filters] as const,
  details: () => [...contactsKeys.all, "detail"] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
};
