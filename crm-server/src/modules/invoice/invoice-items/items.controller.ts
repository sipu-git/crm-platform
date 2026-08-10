import { Request, Response } from "express";
import { createInvoiceItemSchema, updateInvoiceItemSchema } from "./invoice-items.schema.js";
import { invoiceItemsService } from "./items.service.js";
import { successResponse } from "../../../shared/utils/ApiResponse.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

export const invoiceItemsController = {
    async list(req: Request, res: Response) {
        const invoiceId = req.params.invoiceId as string;
        if (!invoiceId) {
            throw ApiError.badRequest("Invoice id is required");
        }
        const items = await invoiceItemsService.list(req.tenantId!, invoiceId);
        return res.status(200).json(successResponse("Invoice items fetched successfully!", items));
    },

    async getById(req: Request, res: Response) {
        const invoiceId = req.params.invoiceId as string;
        const id = req.params.id as string;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        const item = await invoiceItemsService.getById(req.tenantId!, invoiceId, id);
        return res.status(200).json(successResponse("Invoice item fetched successfully!", item));
    },

    async create(req: Request, res: Response) {
        const invoiceId = req.params.invoiceId as string;
        if (!invoiceId) {
            throw ApiError.badRequest("Invoice id is required");
        }
        const data = createInvoiceItemSchema.parse(req.body);
        const item = await invoiceItemsService.create(req.tenantId!, invoiceId, data);
        return res.status(201).json(successResponse("Invoice item added successfully!", item));
    },

    async update(req: Request, res: Response) {
        const invoiceId = req.params.invoiceId as string;
        const id = req.params.id as string;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        const data = updateInvoiceItemSchema.parse(req.body);
        const item = await invoiceItemsService.update(req.tenantId!, invoiceId, id, data);
        return res.status(200).json(successResponse("Invoice item updated successfully!", item));
    },

    async remove(req: Request, res: Response) {
        const invoiceId = req.params.invoiceId as string;
        const id = req.params.id as string;
        if (!invoiceId || !id) {
            throw ApiError.badRequest("Invoice id and item id are required");
        }
        await invoiceItemsService.delete(req.tenantId!, invoiceId, id);
        return res.status(200).json(successResponse("Invoice item removed successfully!", null));
    },
};