import { ApiError } from '../../shared/utils/ApiError';
import { contactsRepository } from './contact.repository';
export const contactService = {
    list(tenantId) {
        return contactsRepository.findMany(tenantId);
    },
    async getById(tenantId, id) {
        const contact = await contactsRepository.findById(tenantId, id);
        if (!contact)
            throw ApiError.notFound('Contact not found');
        return contact;
    },
    create(tenantId, createdBy, input) {
        return contactsRepository.create(tenantId, createdBy, input);
    },
    async update(tenantId, id, input) {
        const result = await contactsRepository.update(tenantId, id, input);
        if (result.count === 0)
            throw ApiError.notFound('Contact not found');
        return contactsRepository.findById(tenantId, id);
    },
    async remove(tenantId, id) {
        const result = await contactsRepository.delete(tenantId, id);
        if (result.count === 0)
            throw ApiError.notFound('Contact not found');
    },
};
