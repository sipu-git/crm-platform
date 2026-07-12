import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(1),
  value: z.number().positive(),
  contactId: z.string().min(1),
  dealType: z.enum(['PRODUCT', 'SERVICE']).default('PRODUCT'),
});

export const updateStageSchema = z.object({
  stage: z.enum(['DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  position: z.number().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;

// Probability heuristic per stage — kept simple and centralized here,
// rather than letting the frontend guess or hardcode it independently.
export const STAGE_PROBABILITY: Record<string, number> = {
  DISCOVERY: 20,
  PROPOSAL: 50,
  NEGOTIATION: 75,
  WON: 100,
  LOST: 0,
};
