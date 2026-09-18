import { LeadStatus } from "@/features/leads/types/lead.types";
import { Circle, PhoneCall, ThumbsUp, ThumbsDown } from "lucide-react";
import type { JSX } from "react";

export const PIPELINE_STAGES: LeadStatus[] = ["NEW", "CONTRACTED", "QUALIFIED", "CONVERTED"];

export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
export const humanize = (s: string) => titleCase(s).replace(/_/g, " ");

export const STATUS_META: Record<
  LeadStatus,
  { icon: JSX.Element; guide: string; tip: string; description: string; shortLabel: string; nextLabel?: string }
> = {
  NEW: {
    icon: <Circle className="h-3.5 w-3.5" />,
    guide: "Just came in. Nobody has reached out yet.",
    tip: "Reach out within 24 hours — day-one contact converts far better than delayed follow-up.",
    description: "Initial contact",
    shortLabel: "New",
    nextLabel: "Mark as Contacted",
  },
  CONTRACTED: {
    icon: <PhoneCall className="h-3.5 w-3.5" />,
    guide: "Contact has been made and a conversation is underway.",
    tip: "Confirm budget, timeline, and decision-maker before moving to Qualified.",
    description: "In conversation",
    shortLabel: "Contacted",
    nextLabel: "Mark as Qualified",
  },
  QUALIFIED: {
    icon: <ThumbsUp className="h-3.5 w-3.5" />,
    guide: "Budget and fit are confirmed — ready to become a deal.",
    tip: "Create a deal so this lead shows up in your pipeline.",
    description: "Ready to convert",
    shortLabel: "Qualified",
  },
  CONVERTED: {
    icon: <ThumbsUp className="h-3.5 w-3.5" />,
    guide: "Lead has been converted into a deal.",
    tip: "This lead has been successfully converted into a deal.",
    description: "Converted to deal",
    shortLabel: "Converted",
  },
  DISQUALIFIED: {
    icon: <ThumbsDown className="h-3.5 w-3.5" />,
    guide: "Not a fit right now. No further follow-up needed.",
    tip: "Leave a short note on why, so the next rep doesn't repeat the same outreach.",
    description: "Not a fit",
    shortLabel: "Disqualified",
  },

};