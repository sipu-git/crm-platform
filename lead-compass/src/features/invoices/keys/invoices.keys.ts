export const invoicesKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoicesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...invoicesKeys.lists(), filters] as const,
  details: () => [...invoicesKeys.all, "detail"] as const,
  detail: (id: string) => [...invoicesKeys.details(), id] as const,
  items: (invoiceId: string) => [...invoicesKeys.detail(invoiceId), "items"] as const,
};
