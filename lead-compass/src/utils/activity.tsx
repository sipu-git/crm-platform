import { Circle, RefreshCw, UserPlus, PhoneCall, MessageSquare, Pencil } from "lucide-react";
import type { JSX } from "react";
import type { Lead, LeadStatus } from "@/features/leads/lead-m/lead.types";

export type LeadActivityType =
  | "created"
  | "status_change"
  | "assigned"
  | "contact_made"
  | "note"
  | "updated";

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  label: string;
  detail?: string;
  timestamp: string;
  actor?: string;
}

export interface StatusHistoryEntry {
  status: LeadStatus;
  changed_At: string;
  actor?: string;
}

export type LeadWithActivity = Lead & {
  activities?: LeadActivity[];
  status_history?: StatusHistoryEntry[];
  assigned_At?: string;
  updated_At?: string;
};

export const ACTIVITY_ICON: Record<LeadActivityType, JSX.Element> = {
  created: <Circle className="h-3.5 w-3.5" />,
  status_change: <RefreshCw className="h-3.5 w-3.5" />,
  assigned: <UserPlus className="h-3.5 w-3.5" />,
  contact_made: <PhoneCall className="h-3.5 w-3.5" />,
  note: <MessageSquare className="h-3.5 w-3.5" />,
  updated: <Pencil className="h-3.5 w-3.5" />,
};