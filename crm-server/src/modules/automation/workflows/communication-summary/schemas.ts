import { z } from "zod";

export const messagesSchema = z.array(z.object({
  sender: z.string().trim().min(1).max(100),
  text: z.string().max(8000),
  date: z.string().max(100).optional(),
})).min(1).max(100);

export const conversationSummarySchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  objections: z.array(z.string().trim().min(1).max(300)).max(20),
});

export const followUpPlanSchema = z.object({
  action_items: z.array(z.object({
    title: z.string().trim().min(1).max(300),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  })).max(20),
});
