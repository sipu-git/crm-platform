import { InvoiceStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../../lib/prisma";
import { eventBus } from "../../../shared/event-bus";
import { cacheQuery } from "../../../shared/redis/query";
import { ApiError } from "../../../shared/utils/ApiError";
import { InvoiceUpdatableFields } from "./invoice.calculation";
import { invoiceRepository } from "./invoice.repository";
import redisService from '../../../shared/redis/caching';

export const invoiceService = {
  async list(tenantId: string, status?: InvoiceStatus, dealId?: string) {
    const redisKey = `invoice-list-${tenantId}-${status}-${dealId}`;
    return cacheQuery(redisKey, 200, async () => {
      const invoice = await prisma.$transaction(async (tx) => {
        return invoiceRepository.findMany(tx, tenantId, status, dealId);
      })
      return invoice;
    })
  },

  async getById(tenantId: string, id: string) {
    const redisCache = `invoice-get-${tenantId}-${id}`;
    return cacheQuery(redisCache, 400, async () => {
      const invoice = await prisma.$transaction(async (tx) => {
        const findInvoice = await invoiceRepository.findById(tx, tenantId, id);
        if (!findInvoice) throw ApiError.notFound('Invoice not found');
        return findInvoice;
      })
      return invoice;
    })
  },

  async updateInvoice(tenantId: string, invoiceId: string, data: Partial<InvoiceUpdatableFields>) {
    const invoice = await prisma.$transaction(async (tx) => {
      const findInvoice = await invoiceRepository.findById(tx, tenantId, invoiceId);
      if (!findInvoice) throw ApiError.notFound('Invoice not found');
      return invoiceRepository.update(tx, invoiceId, data);
    })
    await Promise.all([
      redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
      redisService.deleteByPattern(`invoice-list-${tenantId}-*`)
    ])
    return invoice;
  },

  async markPaid(tenantId: string, id: string) {
    const invoice = await prisma.$transaction(async (tx) => {
      const existing = await invoiceRepository.findById(tx, tenantId, id);
      if (!existing) throw ApiError.notFound('Invoice not found');
      if (existing.status === InvoiceStatus.PAID) {
        throw ApiError.badRequest('Invoice is already marked as paid');
      }

      const remaining = Number(existing.total_amount) - Number(existing.amount_paid);
      return invoiceRepository.recordPayment(tx, id, remaining, 0, new Date(), InvoiceStatus.PAID);
    });
    eventBus.emit('invoice.paid', { invoiceId: id, tenantId, dealId: invoice.deal_id });

    return invoice;
  },

  async removeInvoice(tenantId: string, id: string) {
    const invoice = await prisma.$transaction(async (tx) => {
      const findInvoice = await invoiceRepository.findById(tx, tenantId, id);
      if (!findInvoice) throw ApiError.notFound('Invoice not found');
      return invoiceRepository.delete(tx, tenantId, id);
    })
    await Promise.all([
      redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
      redisService.deleteByPattern(`invoice-list-${tenantId}-*`)
    ])

    return invoice;
  }
};
