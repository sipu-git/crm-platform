// Types for the Audit module

export interface AuditLogUser {
  /** Full name of the user who performed the action */
  full_name?: string;
  /** Email of the user – fallback when full name is unavailable */
  email?: string;
  /** Any other identifier present in the backend payload */
  [key: string]: unknown;
}

export interface AuditLog {
  /** Unique identifier for the audit record */
  id: string | number;
  /** Action performed, e.g. "create", "update", "delete" */
  action: string;
  /** The type of entity the action was performed on */
  entityType: string;
  /** Timestamp – backend may use snake_case or camelCase */
  created_at?: string | number | Date;
  createdAt?: string | number | Date;
  /** Optional user information */
  user?: AuditLogUser;
  /** Additional metadata that may be returned by the API */
  [key: string]: unknown;
}

