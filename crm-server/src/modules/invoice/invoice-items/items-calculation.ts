// items-calculation.ts
import { CreateInvoiceItemInput, UpdateInvoiceItemInput } from "./invoice-items.schema";

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

export function computeInvoiceItemAmounts(data: CreateInvoiceItemInput): ComputedInvoiceItem {
    const gross = data.quantity * data.unit_price;
    const taxable_amount = gross - data.discount_amount;
    const cgst_amount = taxable_amount * (data.cgst_rate / 100);
    const sgst_amount = taxable_amount * (data.sgst_rate / 100);
    const igst_amount = taxable_amount * (data.igst_rate / 100);
    const tax_amount = cgst_amount + sgst_amount + igst_amount;
    const tax_rate = data.cgst_rate + data.sgst_rate + data.igst_rate;
    const total_amount = taxable_amount + tax_amount;

    return {
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        discount_amount: data.discount_amount,
        taxable_amount,
        cgst_rate: data.cgst_rate,
        cgst_amount,
        tax_rate,
        sgst_rate: data.sgst_rate,
        sgst_amount,
        igst_rate: data.igst_rate,
        igst_amount,
        tax_amount,
        total_amount,
        hsn_code: data.hsn_code,
        sac_code: data.sac_code,
    };
}

export function recomputeInvoiceItemAmounts(existing: ComputedInvoiceItem, patch: UpdateInvoiceItemInput): ComputedInvoiceItem {
    const merged: CreateInvoiceItemInput = {
        description: patch.description ?? existing.description,
        quantity: patch.quantity ?? existing.quantity,
        unit_price: patch.unit_price ?? existing.unit_price,
        discount_amount: patch.discount_amount ?? existing.discount_amount,
        tax_rate: patch.tax_rate ?? existing.tax_rate,
        cgst_rate: patch.cgst_rate ?? existing.cgst_rate,
        sgst_rate: patch.sgst_rate ?? existing.sgst_rate,
        igst_rate: patch.igst_rate ?? existing.igst_rate,
        hsn_code: patch.hsn_code ?? existing.hsn_code,
        sac_code: patch.sac_code ?? existing.sac_code,
        // taxable_amount / total_amount / *_amount fields removed —
        // computeInvoiceItemAmounts derives them fresh from rates + quantity + price
    };
    return computeInvoiceItemAmounts(merged);
}