import { z } from "zod";
import { CommunicationChannel, CommunicationDirection, MessageType } from "../../../../generated/prisma/enums";
export const sendCommunicationSchema = z.object({
    tenantId: z
        .string({
        error: "Tenant ID is required",
    })
        .cuid(),
    contactId: z
        .string({
        error: "Contact ID is required",
    })
        .cuid(),
    companyId: z
        .string({
        error: "Company ID is required",
    })
        .cuid(),
    dealId: z.string().cuid().optional(),
    channel: z.nativeEnum(CommunicationChannel),
    direction: z.nativeEnum(CommunicationDirection),
    messageType: z.nativeEnum(MessageType),
    to: z.string({ error: "Recipient is required", }).min(1),
    subject: z.string().optional(),
    body: z.string().optional(),
    mediaUrl: z.string().url().optional(),
    fileName: z.string().optional(),
    createdBy: z.string().cuid().optional(),
});
