// import { BrevoClient } from "@getbrevo/brevo";

import { BrevoClient } from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    throw new Error('email configuration variables are required')
}

export const brevo = new BrevoClient({
     apiKey: process.env.BREVO_API_KEY });

export const BREVO_SENDER = {
    name: process.env.BREVO_SENDER_NAME || "ClearView CRM",
    email: process.env.BREVO_SENDER_EMAIL,
};