import { z } from 'zod';
export const createDealSchema = z.object({
    title: z.string().min(1),
    amount: z.number().positive(),
    contactId: z.string().min(1),
    leadId: z.string().min(1),
    stageId: z.string().min(1),
    expectedCloseDate: z.coerce.date(),
});
export const updateDealSchema = createDealSchema.partial();
export const moveStageSchema = z.object({
    stageId: z.string().cuid("Invalid stage id"),
});
