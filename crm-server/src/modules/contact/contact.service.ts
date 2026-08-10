import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { contactsRepository } from './contact.repository.js';
import type { CreateContactInput, UpdateContactInput } from './contact.schema.js';

export const contactService = {
  async list(tenantId: string) {
    const contact = await prisma.$transaction(async (tx) => {
      return contactsRepository.findMany(tx, tenantId);
    });
    if (!contact) throw ApiError.notFound('No contacts found');
    return contact;
  },

  async getById(tenantId: string, id: string) {
    const contact = await prisma.$transaction(async (tx) => {
      return contactsRepository.findById(tx, tenantId, id);
    });
    if (!contact) throw ApiError.notFound('Contact not found');
    return contact;
  },

  async update(tenantId: string, id: string, input: UpdateContactInput) {
    const contact = await prisma.$transaction(async (tx) => {
      const result = await contactsRepository.update(tx, tenantId, id, input);
      if (result.count === 0) throw ApiError.notFound('Contact not found');
      return contactsRepository.findById(tx, tenantId, id);
    });
    return contact;
  },

  async remove(tenantId: string, id: string) {
    const contact = await prisma.$transaction(async (tx) => {
      const result = await contactsRepository.delete(tx, tenantId, id);
      if (result.count === 0) throw ApiError.notFound('Contact not found');
      return result;
    });
    return contact;
  },
}
