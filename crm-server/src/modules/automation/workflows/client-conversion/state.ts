import { StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export const wonDealEventSchema = z.object({
  tenantId: z.string().min(1),
  dealId: z.string().min(1),
});

export const conversionState = new StateSchema({
  tenantId: z.string().min(1),
  dealId: z.string().min(1),
  outcome: z.enum(["pending", "skipped", "converted"]).default("pending"),
  reason: z.string().optional(),
  clientUserId: z.string().optional(),
  projectId: z.string().optional(),
  alreadyConverted: z.boolean().optional(),
});

export type ConversionState = typeof conversionState.State;
