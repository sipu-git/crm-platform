import type { Request, Response } from 'express';
import { contactService } from './contact.service';
import { createContactSchema, updateContactSchema } from './contact.schema';

export const contactController = {
  async list(req: Request, res: Response) {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const contacts = await contactService.list(req.tenantId!, search);
    res.json(contacts);
  },

  async getById(req: Request, res: Response) {
    const contact = await contactService.getById(req.tenantId!, req.params.id);
    res.json(contact);
  },

  async create(req: Request, res: Response) {
    const input = createContactSchema.parse(req.body);
    const contact = await contactService.create(req.tenantId!, input);
    res.status(201).json(contact);
  },

  async update(req: Request, res: Response) {
    const input = updateContactSchema.parse(req.body);
    const contact = await contactService.update(req.tenantId!, req.params.id, input);
    res.json(contact);
  },

  async remove(req: Request, res: Response) {
    await contactService.remove(req.tenantId!, req.params.id);
    res.status(204).send();
  },
};
