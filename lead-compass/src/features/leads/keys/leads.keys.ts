export const leadsKeys = {
    all: ['leads'] as const,
    lists: () => [...leadsKeys.all, 'list'] as const,
    search: (query: string) => [...leadsKeys.lists(), 'search', query] as const,
    list: (filters?: Record<string, any>) => [...leadsKeys.lists(), filters] as const,
    details: () => [...leadsKeys.all, 'detail'] as const,
    detail: (id: string) => [...leadsKeys.details(), id] as const,
};

