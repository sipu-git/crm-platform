import { AxiosError } from "axios";
import { whatsAppApi } from "../configs/whatsapp.config.js";
import { whatsAppConfig } from "../configs/whatsapp.env.js";
import { ApiError } from "../../../../../shared/utils/ApiError.js";

export const whatsAppService = {
    async sendTextMessage(to: string, message: string) {
        try {
            const response = await whatsAppApi.post(`/${whatsAppConfig.whatsapp.phoneNumberId}/messages`, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { body: message }
            })
            return response.data;

        } catch (error) {
            const axiosErr = error as AxiosError<any>;
            const metaError = axiosErr.response?.data?.error;
            const message = metaError?.message
                ? `WhatsApp send failed: ${metaError.message}`
                : "WhatsApp send failed: unknown error from provider";

            console.error("WhatsApp API error:", metaError ?? axiosErr.message);
            throw new ApiError(axiosErr.response?.status ?? 502, message);
        }
    }
}      
