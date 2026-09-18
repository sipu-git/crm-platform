export const assignmentKeys = {
    all: ['assignment'] as const,
    lists: () => [...assignmentKeys.all, 'list'] as const,
    details: () => [...assignmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...assignmentKeys.details(), id] as const,
};

