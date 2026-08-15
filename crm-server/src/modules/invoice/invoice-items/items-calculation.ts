// items-calculation.ts
import type { CreateInvoiceItemInput, UpdateInvoiceItemInput } from "./invoice-items.schema";

export interface ComputedInvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  tax_amount: number;
  total_amount: number;
  hsn_code?: string;
  sac_code?: string;
}

type InvoiceItemCalculationInput = Omit<CreateInvoiceItemInput, "description" | "tax_rate"> & {
  description: string;
};

export function computeInvoiceItemAmounts(input: InvoiceItemCalculationInput): ComputedInvoiceItem {
  const quantity = input.quantity;
  const unit_price = input.unit_price;
  const discount_amount = input.discount_amount ?? 0;

  const gross = quantity * unit_price;
  const taxable_amount = gross - discount_amount;

  const cgst_rate = input.cgst_rate ?? 0;
  const sgst_rate = input.sgst_rate ?? 0;
  const igst_rate = input.igst_rate ?? 0;

  const cgst_amount = round2((taxable_amount * cgst_rate) / 100);
  const sgst_amount = round2((taxable_amount * sgst_rate) / 100);
  const igst_amount = round2((taxable_amount * igst_rate) / 100);
  const tax_amount = cgst_amount + sgst_amount + igst_amount;
  const tax_rate = cgst_rate + sgst_rate + igst_rate;

  const total_amount = round2(taxable_amount + tax_amount);

  return {
    description: input.description,
    quantity,
    unit_price,
    discount_amount,
    taxable_amount,
    tax_rate,
    cgst_rate,
    cgst_amount,
    sgst_rate,
    sgst_amount,
    igst_rate,
    igst_amount,
    tax_amount,
    total_amount,
    hsn_code: input.hsn_code,
    sac_code: input.sac_code,
  };
}

type ExistingInvoiceItemFields = {
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  tax_amount: number;
  total_amount: number;
  hsn_code?: string;
  sac_code?: string;
};

export function recomputeInvoiceItemAmounts(
  existing: ExistingInvoiceItemFields,
  patch: UpdateInvoiceItemInput
): ComputedInvoiceItem {
  const merged: InvoiceItemCalculationInput = {
    description: patch.description?.trim() || existing.description,
    quantity: patch.quantity ?? existing.quantity,
    unit_price: patch.unit_price ?? existing.unit_price,
    discount_amount: patch.discount_amount ?? existing.discount_amount,
    cgst_rate: patch.cgst_rate ?? existing.cgst_rate,
    sgst_rate: patch.sgst_rate ?? existing.sgst_rate,
    igst_rate: patch.igst_rate ?? existing.igst_rate,
    hsn_code: patch.hsn_code ?? existing.hsn_code,
    sac_code: patch.sac_code ?? existing.sac_code,
  };
  return computeInvoiceItemAmounts(merged);
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}