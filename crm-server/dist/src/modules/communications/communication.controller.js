import { communicationService } from "./communication.service.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";
import { ApiError } from "../../shared/utils/ApiError.js";
export const communicationController = {
    sendCommunication: async (req, res) => {
        const { leadId } = req.params;
        const tenantId = req.tenantId;
        if (!leadId) {
            throw new ApiError(400, "leadId is required");
        }
        if (!tenantId) {
            throw new ApiError(401, "Unauthorized!");
        }
        const result = await communicationService.send(req.body, {
            leadId,
            tenantId,
        });
        return res.status(201).json(successResponse("communication sent successfully", result));
    },
    viewCommunications: async (req, res) => {
        const { leadId } = req.params;
        const tenantId = req.tenantId;
        if (!leadId) {
            throw new ApiError(400, "leadId is required");
        }
        if (!tenantId) {
            throw new ApiError(401, "Unauthorized!");
        }
        const result = await communicationService.viewCommunications(tenantId, leadId);
        return res.status(200).json(successResponse("communications found successfully", result));
    },
};
