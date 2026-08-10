// features/activities/activity.types.ts

import { LeadAssignee } from "../leads/service2/assign.types";

export const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ActivityPriority = (typeof ACTIVITY_PRIORITIES)[number];

// API response shape — mirrors the Prisma record as returned by the backend,
// so this uses `entityType` (the actual Prisma column name).
export interface Activity {
  id: string;
  tenant_id: string;
  deal_id: string;
  contact_id: string;
  company_id: string;
  title: string;
  description: string;
  status: ActivityStatus;
  entityType: ActivityType;
  priority: ActivityPriority;
  due_date: string;
  completed_at: string | null;
  assigned_to: string | null;
  assignee: LeadAssignee | null; // populated via `include: { assignee: true }`
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Request payload shapes — mirror the backend's Zod schema field names
// (`type`, not `entityType`), since that's the actual wire contract for
// POST/PATCH bodies, independent of what Prisma calls the column.
export interface CreateActivityInput {
  dealId: string;
  contactId: string;
  companyId: string;
  title: string;
  description: string;
  type: ActivityType;
  status?: ActivityStatus; // defaults to PENDING server-side
  priority: ActivityPriority;
  dueDate: string; // ISO date string
  assignedTo?: string;
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  dueDate?: string;
  assignedTo?: string;
}

export interface ListActivitiesQuery {
  dealId?: string;
  contactId?: string;
  companyId?: string;
}