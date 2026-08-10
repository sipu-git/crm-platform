import { assigneeService } from "./assign.service.js";
import { assignSchema } from "./assign.schema.js";
import { successResponse } from "../../../shared/utils/ApiResponse.js";
export const assigneeController = {
    async create(req, res) {
        const parsed = assignSchema.parse(req.body);
        const assignee = await assigneeService.create(req.tenantId, parsed);
        return res.status(201).json(successResponse("Assignee created successfully!", assignee));
    },
    async list(req, res) {
        const assignees = await assigneeService.list(req.tenantId);
        return res.status(200).json(successResponse("Assignees fetched successfully!", assignees));
    },
    async getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Assignee id is required" });
        }
        const assignee = await assigneeService.getById(req.tenantId, id);
        return res.status(200).json(successResponse("Assignee fetched successfully!", assignee));
    },
};
