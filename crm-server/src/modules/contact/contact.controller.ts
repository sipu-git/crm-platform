import type { Request, Response } from 'express';
import { contactService } from './contact.service.js';
import { createContactSchema, updateContactSchema } from './contact.schema.js';
import { ApiError } from '../../shared/utils/ApiError.js';

function getId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== 'string') throw ApiError.notFound('Contact not found');
  return id;
}

export const contactController = {
  async list(req: Request, res: Response) {
    const contacts = await contactService.list(req.tenantId!);
    res.json(contacts);
  },

  async getById(req: Request, res: Response) {
    const contact = await contactService.getById(req.tenantId!, getId(req));
    res.json(contact);
  },

  async update(req: Request, res: Response) {
    const input = updateContactSchema.parse(req.body);
    const contact = await contactService.update(req.tenantId!, getId(req), input);
    res.json(contact);
  },

  async remove(req: Request, res: Response) {
    await contactService.remove(req.tenantId!, getId(req));
    res.status(204).send();
  },
};