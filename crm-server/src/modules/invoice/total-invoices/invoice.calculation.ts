import { InvoiceStatus } from "../../../../generated/prisma/enums";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";

export interface InvoiceHeaderInput {
    invoice_type: string;
    deal_id?: string;
    contact_id?: string;
    company_id?: string;
    issue_date: Date;
    due_date: Date;
    currency: string;
    seller_name: string;
    seller_gstin?: string;
    seller_address?: string;
    seller_state?: string;
    buyer_name: string;
    buyer_gstin?: string;
    buyer_address?: string;
    buyer_state?: string;
    notes?: string;
    terms?: string;
}

export async function generateInvoiceNumber(tx: PrismaClientTx, tenantId: string) {
    const count = await tx.invoice.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export type InvoiceUpdatableFields = Omit<InvoiceHeaderInput, "deal_id" | "contact_id" | "company_id" | "invoice_type"> & {
  status?: InvoiceStatus;
};