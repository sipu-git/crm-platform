import { whatsAppService } from "../services/whatsapp.service.js";
import { successResponse } from "../../../../../shared/utils/ApiResponse.js";
export const sendMessage = async (req, res) => {
    const { to, message } = req.body;
    const response = await whatsAppService.sendTextMessage(to, message);
    return res.status(201).json(successResponse("message delivered successfully", response));
};
