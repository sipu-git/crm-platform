import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export function verifyMetaSignature(req: Request, res: Response, next: NextFunction) {
    console.log("🔍 rawBody present?", !!(req as any).rawBody, "length:", (req as any).rawBody?.length);

    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    if (!signature) return res.sendStatus(401);
    console.log("🔍 signature header present?", !!signature);
    const expected =
        "sha256=" +
        crypto
            .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
            .update((req as any).rawBody) // requires raw body capture, see note below
            .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return res.sendStatus(401);
    }
    next();
}