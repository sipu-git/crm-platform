import { InvoiceStatus } from "../../../../generated/prisma/enums";
import { ApiError } from "../../../shared/utils/ApiError";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { generateInvoiceNumber, InvoiceHeaderInput, InvoiceUpdatableFields } from "./invoice.calculation";

export const invoiceRepository = {
  findMany(tx: PrismaClientTx, tenantId: string, status?: InvoiceStatus,dealId?:string) {
    return tx.invoice.findMany({
      where: { tenant_id: tenantId, ...(status ? { status } : {}), ...(dealId ? { deal_id: dealId } : {}) },
      orderBy: { created_at: "desc" },
      include: { deal: true, items: true },
    });
  },

  findById(tx: PrismaClientTx, tenantId: string, id: string, dealId?: string) {
    return tx.invoice.findFirst({
      where: { id, tenant_id: tenantId },
      include: { deal: true, items: true },
    });
  },

  async createDraftFromDeal(tx: PrismaClientTx, tenantId: string, dealId: string, amount: number, dueDate: Date) {
    const invoice_number = await generateInvoiceNumber(tx, tenantId);

    const deal = await tx.deal.findUnique({
      where: {
        id: dealId,
      },
      include: {
        leads: true
      }
    });

    if (!deal) {
      throw new Error("Deal not found");
    }

    const existing = await tx.invoice.findFirst({ where: { deal_id: dealId, tenant_id: tenantId, status: 'DRAFT' } });
    if (existing) {
      throw ApiError.badRequest('Invoice already exists');
    }
    // Get seller information
    const seller = await tx.user.findFirst({
      where: {
        tenantId: tenantId,
      },
    });

    if (!seller) {
      throw new Error("Seller information not found");
    }

    const company = deal.leads.company_name;

    if (!company) {
      throw new Error("Buyer company not found for this deal");
    }

    return tx.invoice.create({
      data: {
        tenant_id: tenantId,
        invoice_number,
        invoice_type: "B2B",
        status: "DRAFT",
        deal_id: deal.id,
        issue_date: new Date(),
        due_date: dueDate,
        currency: "INR",
        // Seller
        seller_name: seller.company_name,
        // Buyer
        buyer_name: company,
        subtotal: amount,
        discount_amount: 0,
        taxable_amount: amount,

        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        tax_amount: 0,

        total_amount: amount,
        amount_paid: 0,
        amount_due: amount,
      },
    });
  },
  update(tx: PrismaClientTx, id: string, data: Partial<InvoiceUpdatableFields>) {
    return tx.invoice.update({
      where: { id },
      data,
    });
  },

  updateTotals(tx: PrismaClientTx, id: string, totals: {
    subtotal: number;
    discount_amount: number;
    taxable_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    tax_amount: number;
    total_amount: number;
    amount_due: number;
  }
  ) {
    return tx.invoice.update({
      where: { id },
      data: totals,
    });
  },

  recordPayment(tx: PrismaClientTx, id: string, amountPaid: number, amountDue: number, paidAt: Date,
    newStatus: InvoiceStatus
  ) {
    return tx.invoice.update({
      where: { id },
      data: {
        amount_paid: { increment: amountPaid },
        amount_due: amountDue,
        paid_at: paidAt,
        status: newStatus,
      },
    });
  },

  delete(tx: PrismaClientTx, id: string) {
    return tx.invoice.delete({
      where: { id },
    });
  },
};