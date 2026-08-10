import { invoiceService } from './invoice.service.js';
import { listInvoicesQuerySchema } from './invoice.schema.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { successResponse } from '../../../shared/utils/ApiResponse.js';
function getId(req) {
    const { id } = req.params;
    if (typeof id !== 'string')
        throw ApiError.notFound('Contact not found');
    return id;
}
export const invoiceController = {
    async list(req, res) {
        const parsed = listInvoicesQuerySchema.parse(req.query);
        const invoices = await invoiceService.list(req.tenantId, parsed.status, parsed.dealId);
        return res.status(200).json(successResponse("Invoices fetched successfully!", invoices));
    },
    async getById(req, res) {
        const invoice = await invoiceService.getById(req.tenantId, getId(req));
        return res.status(200).json(successResponse("Invoice fetched successfully!", invoice));
    },
    async modifyInvoice(req, res) {
        const invoice = await invoiceService.updateInvoice(req.tenantId, getId(req), req.body);
        return res.status(201).json(successResponse("Invoice modified successfully!", invoice));
    },
    async markPaid(req, res) {
        const invoice = await invoiceService.markPaid(req.tenantId, getId(req));
        return res.status(200).json(successResponse("Invoices marked successfully!", invoice));
    },
};
