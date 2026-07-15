import { prisma } from '../../core/database/prisma';
import type { CreateInvoiceInput } from './invoice.schema';

function computeTotal(lineItems: { quantity: number; unitPrice: number }[]) {
  return lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
}

export const invoiceRepository = {
  findMany(tenantId: string, status?: string) {
    return prisma.invoice.findMany({
      where: { tenantId, ...(status ? { status: status as any } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { lineItems: true, deal: true },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { lineItems: true, deal: true },
    });
  },

  create(tenantId: string, input: CreateInvoiceInput) {
    const total = computeTotal(input.lineItems);
    return prisma.invoice.create({
      data: {
        tenantId,
        dealId: input.dealId,
        dueDate: new Date(input.dueDate),
        total,
        lineItems: { create: input.lineItems },
      },
      include: { lineItems: true },
    });
  },

  /** Used by invoice.listener.ts when a Deal is marked Won. */
  createDraftFromDeal(tenantId: string, dealId: string, title: string, value: number, dueDate: Date) {
    return prisma.invoice.create({
      data: {
        tenantId,
        dealId,
        status: 'DRAFT',
        dueDate,
        total: value,
        lineItems: { create: [{ description: title, quantity: 1, unitPrice: value }] },
      },
      include: { lineItems: true },
    });
  },

  markPaid(tenantId: string, id: string) {
    return prisma.invoice.updateMany({ where: { id, tenantId }, data: { status: 'PAID' } });
  },
};
