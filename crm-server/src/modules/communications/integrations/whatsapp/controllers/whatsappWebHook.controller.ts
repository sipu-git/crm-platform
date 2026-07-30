import { Request, Response } from "express";
import { whatsAppConfig } from "../configs/whatsapp.env";
import { whatsappHookService } from "../services/webhook.service";

export const whatsappHookController = {
    async verifyWebHook(req: Request, res: Response) {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        console.log("Mode:", mode);
        console.log("Token:", token);
        console.log("Challenge:", challenge);
        console.log("ENV Token:", process.env.WHATSAPP_VERIFY_TOKEN);
        if (mode && token) {
            if (mode === "subscribe" && token === whatsAppConfig.whatsapp.verifyToken) {
                console.log("WEBHOOK_VERIFIED");
                return res.status(200).send(challenge);
            } else {
                return res.sendStatus(403);
            }
        }
    },
    async receiveWebHook(req: Request, res: Response) {
        console.log("🔔 WEBHOOK HIT, body:", JSON.stringify(req.body, null, 2));
        res.sendStatus(200);
        try {
            await whatsappHookService.processEvent(req.body);
        } catch (err) {
            console.error("Failed to process WhatsApp webhook event:", err);
        }
    },
}
