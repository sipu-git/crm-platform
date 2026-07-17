import { z } from 'zod';
import { ActivityStatus, AuditEntityType } from '../../../generated/prisma/enums';

export const createActivitySchema = z.object({
  dealId: z.string().min(1),
  contactId: z.string().min(1),
  companyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  entityType:z.enum(AuditEntityType),
  status: z.enum(ActivityStatus).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.coerce.date(),
  assignedTo: z.string().min(1),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(ActivityStatus).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.coerce.date().optional(),
  assignedTo: z.string().min(1).optional(),
});

export const listActivitiesQuerySchema = z.object({
  dealId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;