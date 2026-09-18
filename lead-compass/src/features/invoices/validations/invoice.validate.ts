import { z } from "zod";

export const invoiceItemFormSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit_price: z.coerce.number().nonnegative("Unit price cannot be negative"),
  discount_amount: z.coerce.number().nonnegative("Discount cannot be negative").default(0),
  cgst_rate: z.coerce.number().nonnegative().default(0),
  sgst_rate: z.coerce.number().nonnegative().default(0),
  igst_rate: z.coerce.number().nonnegative().default(0),
  hsn_code: z.string().optional(),
  sac_code: z.string().optional(),
}).refine(
  (data) => {
    const hasIntraState = data.cgst_rate > 0 || data.sgst_rate > 0;
    const hasInterState = data.igst_rate > 0;
    return !(hasIntraState && hasInterState);
  },
  {
    message: "An item can't have both CGST/SGST and IGST — choose intra-state or inter-state, not both",
    path: ["igst_rate"], // surfaces the error near the conflicting field
  }
).refine(
  (data) => data.discount_amount <= data.quantity * data.unit_price,
  {
    message: "Discount can't exceed the line total",
    path: ["discount_amount"],
  }
);

export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;
export type InvoiceItemFormErrors = Partial<Record<keyof InvoiceItemFormValues, string>>;

export const INVOICE_ITEM_FORM_DEFAULTS: InvoiceItemFormValues = {
  description: "",
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  cgst_rate: 0,
  sgst_rate: 0,
  igst_rate: 0,
  hsn_code: "",
  sac_code: "",
};

export function validateInvoiceItemForm(values: InvoiceItemFormValues): InvoiceItemFormErrors {
  const result = invoiceItemFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: InvoiceItemFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof InvoiceItemFormValues;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}