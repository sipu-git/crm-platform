import { prisma } from '../../../lib/prisma.js';
import { cacheQuery } from '../../shared/redis/query.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { contactsRepository } from './contact.repository.js';
import type { CreateContactInput, UpdateContactInput } from './contact.schema.js';
import redisService from '../../shared/redis/caching.js';

export const contactService = {
  async list(tenantId: string) {
    let redisKey = `contact-list-${tenantId}`;
    return cacheQuery(redisKey, 500, async () => {
      const contact = await prisma.$transaction(async (tx) => {
        return contactsRepository.findMany(tx, tenantId);
      });
      if (!contact) throw ApiError.notFound('No contacts found');
      return contact;
    })
  },

  async getById(tenantId: string, id: string) {
    let redisKey = `contact-get-${tenantId}-${id}`;
    return cacheQuery(redisKey, 200, async () => {
      const contact = await prisma.$transaction(async (tx) => {
        return contactsRepository.findById(tx, tenantId, id);
      });
      if (!contact) throw ApiError.notFound('Contact not found');
      return contact;
    })
  },
  async autoFillByEmail(tenantId: string, email: string) {
    const contact = await prisma.$transaction(async (tx) => {
      return contactsRepository.autoFillByEmail(tx, tenantId, email)
    })
    return contact;
  },

  async update(tenantId: string, id: string, input: UpdateContactInput) {
    const contact = await prisma.$transaction(async (tx) => {
      const result = await contactsRepository.update(tx, tenantId, id, input);
      if (result.count === 0) throw ApiError.notFound('Contact not found');
      return contactsRepository.findById(tx, tenantId, id);
    });
    await Promise.all([
      redisService.deleteByPattern(`contact-get-${tenantId}-*`),
      redisService.deleteByPattern(`contact-list-${tenantId}-*`)
    ])
    return contact;
  },

  async remove(tenantId: string, id: string) {
    const contact = await prisma.$transaction(async (tx) => {
      const result = await contactsRepository.delete(tx, tenantId, id);
      if (result.count === 0) throw ApiError.notFound('Contact not found');
      return result;
    });
    await Promise.all([
      redisService.deleteByPattern(`contact-get-${tenantId}-*`),
      redisService.deleteByPattern(`contact-list-${tenantId}-*`)
    ])

    return contact;
  },
}
