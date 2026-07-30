import { invoiceService } from './invoice.service.js';
import { createInvoiceSchema } from './invoice.schema.js';
import { ApiError } from '../../shared/utils/ApiError.js';
function getId(req) {
    const { id } = req.params;
    if (typeof id !== 'string')
        throw ApiError.notFound('Contact not found');
    return id;
}
export const invoiceController = {
    async list(req, res) {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const invoices = await invoiceService.list(req.tenantId, status);
        res.json(invoices);
    },
    async getById(req, res) {
        const invoice = await invoiceService.getById(req.tenantId, getId(req));
        res.json(invoice);
    },
    async create(req, res) {
        const input = createInvoiceSchema.parse(req.body);
        const invoice = await invoiceService.create(req.tenantId, input);
        res.status(201).json(invoice);
    },
    async markPaid(req, res) {
        const invoice = await invoiceService.markPaid(req.tenantId, getId(req));
        res.json(invoice);
    },
};
