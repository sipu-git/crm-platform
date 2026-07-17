import { prisma } from '../../../lib/prisma';
import type { CreateInvoiceInput } from './invoice.schema';

function computeTotal(lineItems: { quantity: number; unitPrice: number }[]) {
  return lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
}

async function generateInvoiceNumber(tenantId: string) {
  const count = await prisma.invoice.count({ where: { tenant_id: tenantId } });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
}

export const invoiceRepository = {
  findMany(tenantId: string, status?: string) {
    return prisma.invoice.findMany({
      where: { tenant_id: tenantId, ...(status ? { status: status as any } : {}) },
      orderBy: { created_at: 'desc' },
      include: { deal: true },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.invoice.findFirst({
      where: { id, tenant_id: tenantId },
      include: { deal: true },
    });
  },

  async create(tenantId: string, input: CreateInvoiceInput) {
    const deal = await prisma.deal.findFirstOrThrow({
      where: { id: input.dealId, tenant_id: tenantId },
      select: { contact_id: true, company_id: true },
    });

    const total = computeTotal(input.lineItems);
    const invoice_number = await generateInvoiceNumber(tenantId);

    return prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        invoice_number,
        deal_id: input.dealId,
        contact_id: deal.contact_id,
        company_id: deal.company_id,
        due_date: new Date(input.dueDate),
        total_amount: total,
        status: "DRAFT",
        issue_date: new Date(),
        updated_at: new Date()
      },
    });
  },

  /** Used by invoice.listener.ts when a Deal is marked Won. */
  async createDraftFromDeal(tenantId: string, dealId: string, title: string, value: number, dueDate: Date) {
    const deal = await prisma.deal.findFirstOrThrow({
      where: { id: dealId, tenant_id: tenantId },
      select: { contact_id: true, company_id: true },
    });

    const invoice_number = await generateInvoiceNumber(tenantId);

    return prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        invoice_number,
        deal_id: dealId,
        contact_id: deal.contact_id,
        company_id: deal.company_id,
        status: 'DRAFT',
        due_date: dueDate,
        total_amount: value,
        notes: title,
        issue_date: new Date(),
        updated_at: new Date()
      },
    });
  },

  markPaid(tenantId: string, id: string) {
    return prisma.invoice.updateMany({
      where: { id, tenant_id: tenantId },
      data: { status: 'PAID', paid_at: new Date() },
    });
  },
};