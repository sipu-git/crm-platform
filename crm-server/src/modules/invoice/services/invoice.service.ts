import { InvoiceStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../../lib/prisma";
import { eventBus } from "../../../shared/event-bus";
import { cacheQuery } from "../../../shared/redis/query";
import { ApiError } from "../../../shared/utils/ApiError";
import { InvoiceUpdatableFields } from "../utils/invoice.calculation";
import redisService from '../../../shared/redis/caching';
import { invoiceRepository } from "../repositories/invoice.repository";
import { AccessTokenPayload } from "../../../shared/utils/jwt";

export const invoiceService = {
  async list(tenantId: string, user: AccessTokenPayload, status?: InvoiceStatus, dealId?: string) {
    const scopeKey = user.role === "CLIENT" ? user.companyId : user.userId;
    const redisKey = `invoice-list-${tenantId}-${user.role}-${scopeKey}-${status ?? 'all'}-${dealId ?? 'all'}`;
    return cacheQuery(redisKey, 200, async () => {
      const invoice = await prisma.$transaction(async (tx) => {
        return invoiceRepository.findMany(tx, tenantId, user, status, dealId);
      })
      return invoice;
    })
  },
  async getById(tenantId: string, id: string, user?: AccessTokenPayload) {
    const redisCache = `invoice-get-${tenantId}-${id}`;
    return cacheQuery(redisCache, 400, async () => {
      const invoice = await prisma.$transaction(async (tx) => {
        const findInvoice = await invoiceRepository.findById(tx, tenantId, id, undefined, user);
        if (!findInvoice) throw ApiError.notFound('Invoice not found');
        return findInvoice;
      })
      return invoice;
    })
  },
  
  async viewOwnInvoice(tenantId: string, creator: string) {
    const invoice = await prisma.$transaction(async (tx) => {
      return invoiceRepository.findOwnInvoice(tx, tenantId, creator);
    })
    return invoice;
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
