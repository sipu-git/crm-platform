import { CommunicationChannel, MessageType } from "@/features/communications/communication.types";
import { CallIcon, EmailIcon, NoteIcon, SmsIcon, WhatsAppIcon } from "@/features/ui/icons/channel";

export type IconProps = { className?: string; style?: React.CSSProperties };

export const CHANNEL_META: Record<CommunicationChannel,{ label: string; icon: React.ComponentType<IconProps>; tint: string }
> = {
  WHATSAPP: { label: "WhatsApp", icon: WhatsAppIcon, tint: "#25D366" },
  EMAIL: { label: "Email", icon: EmailIcon, tint: "#3B82F6" },
  CALL: { label: "Call", icon: CallIcon, tint: "#8B5CF6" },
  SMS: { label: "SMS", icon: SmsIcon, tint: "#F59E0B" },
  INTERNAL_NOTE: { label: "Note", icon: NoteIcon, tint: "#94A3B8" },
};

export const CHANNEL_ORDER: CommunicationChannel[] = ["WHATSAPP", "EMAIL", "SMS", "CALL", "INTERNAL_NOTE"];

export const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Document" },
];

export const QUICK_REPLIES = [
  "Thanks for getting back to me!",
  "Are you free for a quick call tomorrow?",
  "Just checking in — any updates?",
];

export const MAX_CHARS = 1000;