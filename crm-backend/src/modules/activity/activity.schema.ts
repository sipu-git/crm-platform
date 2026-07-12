import { z } from 'zod';

export const createActivitySchema = z.object({
  entityType: z.enum(['lead', 'deal', 'contact']),
  entityId: z.string().min(1),
  type: z.enum(['CALL', 'EMAIL', 'NOTE', 'STAGE_CHANGE']),
  content: z.string().min(1),
});

export const listActivitiesQuerySchema = z.object({
  entityType: z.enum(['lead', 'deal', 'contact']),
  entityId: z.string().min(1),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
