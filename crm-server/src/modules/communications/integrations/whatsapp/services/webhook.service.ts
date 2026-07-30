import { CommunicationChannel, CommunicationStatus, MessageType } from "../../../../../../generated/prisma/enums";
import { prisma } from "../../../../../../lib/prisma";
import { toWhatsAppNumber } from "../../../../../shared/utils/phoneZone";

const WHATSAPP_MESSAGE_TYPE_MAP: Record<string, MessageType> = {
    text: MessageType.TEXT,
    image: MessageType.IMAGE,
    video: MessageType.VIDEO,
    audio: MessageType.AUDIO,
    document: MessageType.DOCUMENT,
};

const WHATSAPP_STATUS_MAP: Record<string, CommunicationStatus> = {
    sent: CommunicationStatus.SENT,
    delivered: CommunicationStatus.DELIVERED,
    read: CommunicationStatus.READ,
    failed: CommunicationStatus.FAILED,
};

export const whatsappHookService = {
    async processEvent(body: any) {
        const value = body?.entry?.[0]?.changes?.[0]?.value;
        if (!value) return;

        if (value.messages?.length) {
            for (const msg of value.messages) {
                await this.handleIncomingMessage(msg);
            }
        }

        if (value.statuses?.length) {
            for (const status of value.statuses) {
                await this.handleStatusUpdate(status);
            }
        }
    },

    async handleIncomingMessage(msg: any) {
        const fromNumber = toWhatsAppNumber(msg.from);

        const lead = await prisma.leads.findFirst({
            where: { phone: { contains: fromNumber.slice(-10) } },
        });

        if (!lead) {
            console.warn(`Incoming WhatsApp message from unrecognized number: ${msg.from}`);
            return;
        }

        // Avoid double-inserting on Meta's retries — provider_message_id is unique per message.
        const existing = await prisma.communications.findFirst({
            where: { provider_message_id: msg.id },
        });
        if (existing) return;

        const messageType = WHATSAPP_MESSAGE_TYPE_MAP[msg.type] ?? MessageType.TEXT;
        const body = msg.text?.body ?? `[${msg.type} message]`;

        await prisma.communications.create({
            data: {
                tenant_id: lead.tenant_id,
                lead_id: lead.id,
                company_id: lead.companyId ?? null,
                channel: CommunicationChannel.WHATSAPP,
                direction: "INBOUND",
                message_type: messageType,
                body,
                provider_message_id: msg.id,
                status: CommunicationStatus.RECEIVED,
                metaData: msg,
            },
        });
    },

    async handleStatusUpdate(status: any) {
        const mapped = WHATSAPP_STATUS_MAP[status.status];
        if (!mapped) return;

        await prisma.communications.updateMany({
            where: { provider_message_id: status.id },
            data: { status: mapped },
        });
    },
};