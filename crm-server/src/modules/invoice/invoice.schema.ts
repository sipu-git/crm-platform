import { z } from 'zod';

export const createInvoiceSchema = z.object({
  dealId: z.string().min(1),
  dueDate: z.string().min(1),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
