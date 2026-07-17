import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(1),
  value: z.number().positive(),
  contactId: z.string().min(1),
  stageId: z.string().min(1),
  expectedCloseDate: z.coerce.date(),
});

export const updateStageSchema = z.object({
  stageId: z.string().min(1),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;