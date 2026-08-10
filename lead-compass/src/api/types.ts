export type ApiUser = { id: string; name: string; email: string; role: string; tenantId: string };


export type Contact = { id: string; firstName: string; lastName: string; email: string; phone?: string | null; companyId: string; created_at?: string };
export type Deal = { id: string; title: string; value: number; contactId: string; stageId: string; expectedCloseDate: string; probability?: number; created_at?: string; stage?: { id: string; name: string } };
export type InvoiceLine = { description: string; quantity: number; unitPrice: number };
export type Invoice = { id: string; dealId?: string; deal_id?: string; dueDate: string; status: string; invoiceNumber?: string; number?: string; lineItems?: InvoiceLine[]; created_at?: string; total?: number };
export type Activity = { id: string; title: string; description: string; status: string; priority: string; dueDate: string; assignedTo: string; created_at?: string };
export type AuditLog = { id: string; action: string; entityType: string; entityId: string; created_at?: string; createdAt?: string; user?: { full_name?: string; email?: string } };
