import { z } from "zod";

export const emailContextSchema = z.object({
  clientName: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  lastInteraction: z.string().max(4000).optional(),
  purpose: z.string().max(1000).optional(),
  tone: z.enum(["professional", "persuasive", "friendly"]).optional(),
});

export const emailDraftSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
});
