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

function getCompanyPrefix(companyName: string): string {
  const cleaned = companyName.trim().toUpperCase().replace(/[^A-Z]/g, "");
  return (cleaned.slice(0, 3) || "GEN").padEnd(3, "X"); // pad if name is 1-2 letters
}

export async function generateInvoiceNumber(
  tx: PrismaClientTx,
  tenantId: string,
  companyName: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = getCompanyPrefix(companyName);

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random, 1000-9999
    const invoice_number = `${prefix}-${year}-${random}`;

    const existing = await tx.invoice.findUnique({
      where: { tenant_id_invoice_number: { tenant_id: tenantId, invoice_number } },
    });

    if (!existing) return invoice_number;
  }

  return `${prefix}-${year}-${Date.now().toString().slice(-6)}`;
}

export type InvoiceUpdatableFields = Omit<InvoiceHeaderInput, "deal_id" | "contact_id" | "company_id" | "invoice_type"> & {
  status?: InvoiceStatus;
};