// communication.types.ts

import { Contact } from "../contacts/contact.types";

export const COMMUNICATION_CHANNELS = ["WHATSAPP","EMAIL","CALL","SMS","INTERNAL_NOTE"] as const;

export type CommunicationChannel =(typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_DIRECTIONS = ["INBOUND","OUTBOUND"] as const;

export type CommunicationDirection =(typeof COMMUNICATION_DIRECTIONS)[number];

export const COMMUNICATION_STATUSES = [
  "QUEUED",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
  "RECEIVED",
] as const;

export type CommunicationStatus =
  (typeof COMMUNICATION_STATUSES)[number];

export const MESSAGE_TYPES = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "EMAIL",
  "NOTE",
] as const;

export type MessageType =
  (typeof MESSAGE_TYPES)[number];

export interface Communication {
  id: string;
  tenant_id: string;
  lead_id: string;
  contact_id?: string | null;
  deal_id?: string | null;
  company_id: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  message_type: MessageType;
  subject?: string | null;
  body?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  file_name?: string | null;
  provider_message_id?: string | null;
  status: CommunicationStatus;
  metaData?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationPayload{
    channel: CommunicationChannel;
    direction: CommunicationDirection;
    messageType: MessageType;
    subject?: string;
    body: string;
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
}


export interface CommunicationFilters {
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
  direction?: CommunicationDirection;
  leadId?: string;
  contactId?: string;
}

// communications.types.ts (or wherever Communication is defined)
export interface CommunicationsResponse {
  contact: Contact | null;
  communications: Communication[];
}

export interface CommunicationState {
  data:  CommunicationsResponse | null;
  communication: Communication | null;
  loading: boolean;
  error: string | null;
  filters: CommunicationFilters;
}