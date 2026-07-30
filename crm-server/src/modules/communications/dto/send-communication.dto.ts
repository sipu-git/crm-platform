import { CommunicationChannel, CommunicationDirection, CommunicationStatus, MessageType } from "../../../../generated/prisma/enums";

export interface SendCommunicationDto {
  tenantId: string;
  // leadId: string;
  contactId: string;
  companyId: string;
  dealId?: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  messageType: MessageType;
  to: string;
  subject?: string;
  body?: string;
  mediaUrl?: string;
  fileName?: string;
  createdBy?: string;
  status?: CommunicationStatus;
}

export interface SendCommunicationContext {
  leadId: string;
  tenantId: string;
  companyId?: string;
  createdBy?: string;
}