import { contactRepository } from './contact.repository';
import { ApiError } from '../../core/utils/ApiError';
import type { CreateContactInput, UpdateContactInput } from './contact.schema';

export const contactService = {
  list(tenantId: string, search?: string) {
    return contactRepository.findMany(tenantId, search);
  },

  async getById(tenantId: string, id: string) {
    const contact = await contactRepository.findById(tenantId, id);
    if (!contact) throw ApiError.notFound('Contact not found');
    return contact;
  },

  create(tenantId: string, input: CreateContactInput) {
    return contactRepository.create(tenantId, input);
  },

  async update(tenantId: string, id: string, input: UpdateContactInput) {
    const result = await contactRepository.update(tenantId, id, input);
    if (result.count === 0) throw ApiError.notFound('Contact not found');
    return contactRepository.findById(tenantId, id);
  },

  async remove(tenantId: string, id: string) {
    const result = await contactRepository.remove(tenantId, id);
    if (result.count === 0) throw ApiError.notFound('Contact not found');
  },
};
