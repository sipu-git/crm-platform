import { ApiError } from '../../shared/utils/ApiError';
import { contactsRepository } from './contact.repository';
import type { CreateContactInput, UpdateContactInput } from './contact.schema';

export const contactService = {
  list(tenantId: string) {
    return contactsRepository.findMany(tenantId);
  },

  async getById(tenantId: string, id: string) {
    const contact = await contactsRepository.findById(tenantId, id);
    if (!contact) throw ApiError.notFound('Contact not found');
    return contact;
  },

  create(tenantId: string,createdBy: string, input: CreateContactInput) {
    return contactsRepository.create(tenantId,createdBy, input);
  },


  async update(tenantId: string, id: string, input: UpdateContactInput) {
    const result = await contactsRepository.update(tenantId, id, input);
    if (result.count === 0) throw ApiError.notFound('Contact not found');
    return contactsRepository.findById(tenantId, id);
  },

  async remove(tenantId: string, id: string) {
    const result = await contactsRepository.delete(tenantId, id);
    if (result.count === 0) throw ApiError.notFound('Contact not found');
  },
};
