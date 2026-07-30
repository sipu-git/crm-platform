import crypto from "crypto";
export function verifyMetaSignature(req, res, next) {
    console.log("🔍 rawBody present?", !!req.rawBody, "length:", req.rawBody?.length);
    const signature = req.headers["x-hub-signature-256"];
    if (!signature)
        return res.sendStatus(401);
    console.log("🔍 signature header present?", !!signature);
    const expected = "sha256=" +
        crypto
            .createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
            .update(req.rawBody) // requires raw body capture, see note below
            .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return res.sendStatus(401);
    }
    next();
}
