import dotenv from "dotenv";

dotenv.config();

export const whatsAppConfig = {
    whatsapp: {
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN!,
        apiVersion: process.env.WHATSAPP_API_VERSION!,
    },
};