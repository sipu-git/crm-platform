import { createInvoiceItemSchema, updateInvoiceItemSchema } from "./invoice-items.schema.js";
import { invoiceItemsService } from "./items.service.js";
import { successResponse } from "../../../shared/utils/ApiResponse.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
export const invoiceItemsController = {
    async list(req, res) {
        const invoiceId = req.params.invoiceId;
        if (!invoiceId) {
            throw ApiError.badRequest("Invoice id is required");
        }
        const items = await invoiceItemsService.list(req.tenantId, invoiceId);
        return res.status(200).json(successResponse("Invoice items fetched successfully!", items));
    },
    async getById(req, res) {
        const invoiceId = req.params.invoiceId;
        const id = req.params.id;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        const item = await invoiceItemsService.getById(req.tenantId, invoiceId, id);
        return res.status(200).json(successResponse("Invoice item fetched successfully!", item));
    },
    async create(req, res) {
        const invoiceId = req.params.invoiceId;
        if (!invoiceId) {
            throw ApiError.badRequest("Invoice id is required");
        }
        const data = createInvoiceItemSchema.parse(req.body);
        const item = await invoiceItemsService.create(req.tenantId, invoiceId, data);
        return res.status(201).json(successResponse("Invoice item added successfully!", item));
    },
    async update(req, res) {
        const invoiceId = req.params.invoiceId;
        const id = req.params.id;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        const data = updateInvoiceItemSchema.parse(req.body);
        const item = await invoiceItemsService.update(req.tenantId, invoiceId, id, data);
        return res.status(200).json(successResponse("Invoice item updated successfully!", item));
    },
    async remove(req, res) {
        const invoiceId = req.params.invoiceId;
        const id = req.params.id;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        await invoiceItemsService.delete(req.tenantId, invoiceId, id);
        return res.status(200).json(successResponse("Invoice item removed successfully!", null));
    },
};
