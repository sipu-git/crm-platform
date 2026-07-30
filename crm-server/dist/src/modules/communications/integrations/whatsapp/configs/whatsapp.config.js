import axios from "axios";
import { whatsAppConfig } from "./whatsapp.env.js";
export const whatsAppApi = axios.create({
    baseURL: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`,
    headers: {
        Authorization: `Bearer ${whatsAppConfig.whatsapp.accessToken}`,
        "Content-Type": "application/json"
    }
});
