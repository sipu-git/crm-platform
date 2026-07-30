import { contactService } from './contact.service.js';
import { createContactSchema, updateContactSchema } from './contact.schema.js';
import { ApiError } from '../../shared/utils/ApiError.js';
function getId(req) {
    const { id } = req.params;
    if (typeof id !== 'string')
        throw ApiError.notFound('Contact not found');
    return id;
}
export const contactController = {
    async list(req, res) {
        const contacts = await contactService.list(req.tenantId);
        res.json(contacts);
    },
    async getById(req, res) {
        const contact = await contactService.getById(req.tenantId, getId(req));
        res.json(contact);
    },
    async create(req, res) {
        const input = createContactSchema.parse(req.body);
        const contact = await contactService.create(req.tenantId, req.userId, input);
        res.status(201).json(contact);
    },
    async update(req, res) {
        const input = updateContactSchema.parse(req.body);
        const contact = await contactService.update(req.tenantId, getId(req), input);
        res.json(contact);
    },
    async remove(req, res) {
        await contactService.remove(req.tenantId, getId(req));
        res.status(204).send();
    },
};
