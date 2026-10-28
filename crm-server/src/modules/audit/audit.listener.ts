import { eventBus } from '../../shared/event-bus/index.js';
import { auditService } from './audit.service.js';

async function recordAudit(
  event: string,
  tenantId: string,
  action: string,
  entityType: 'Lead' | 'Deal' | 'Invoice' | 'User',
  entityId: string,
  userId?: string,
  metadata?: unknown,
) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await auditService.record(tenantId, action, entityType, entityId, userId, metadata);
      return;
    } catch (error) {
      if (attempt === 3) {
        console.error(`Failed to write audit record for ${event} after ${attempt} attempts`, error);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** (attempt - 1)));
    }
  }
}

export function registerAuditListeners() {
  eventBus.on('lead.created', (p: { leadId: string; tenantId: string; userId?: string }) =>
    recordAudit('lead.created', p.tenantId, 'lead.created', 'Lead', p.leadId, p.userId)
  );
  eventBus.on('lead.status_changed', (p: { leadId: string; tenantId: string; userId?: string; status: string }) =>
    recordAudit('lead.status_changed', p.tenantId, 'lead.status_changed', 'Lead', p.leadId, p.userId, { status: p.status })
  );
  eventBus.on('lead.updated', (p: { leadId: string; tenantId: string; userId?: string; changedFields: string[] }) =>
    recordAudit('lead.updated', p.tenantId, 'lead.updated', 'Lead', p.leadId, p.userId, { changedFields: p.changedFields })
  );
  eventBus.on('lead.deleted', (p: { leadId: string; tenantId: string; userId?: string }) =>
    recordAudit('lead.deleted', p.tenantId, 'lead.deleted', 'Lead', p.leadId, p.userId)
  );
  eventBus.on('lead.assigned', (p: { leadId: string; tenantId: string; assignedTo: string | null; userId?: string }) =>
    recordAudit('lead.assigned', p.tenantId, 'lead.assigned', 'Lead', p.leadId, p.userId, { assignedTo: p.assignedTo })
  );
  eventBus.on('lead.converted', (p: { leadId: string; tenantId: string; clientUserId: string; isNewClient: boolean; userId?: string }) =>
    recordAudit('lead.converted', p.tenantId, 'lead.converted', 'Lead', p.leadId, p.userId, {
      clientUserId: p.clientUserId,
      isNewClient: p.isNewClient,
    })
  );
  eventBus.on('deal.created', (p: { dealId: string; tenantId: string; userId?: string; leadId?: string }) =>
    recordAudit('deal.created', p.tenantId, 'deal.created', 'Deal', p.dealId, p.userId, { leadId: p.leadId })
  );
  eventBus.on('deal.stage_changed', (p: { dealId: string; tenantId: string; stage: string; userId?: string }) =>
    recordAudit('deal.stage_changed', p.tenantId, 'deal.stage_changed', 'Deal', p.dealId, p.userId, { stage: p.stage })
  );
  eventBus.on('deal.updated', (p: { dealId: string; tenantId: string; userId?: string; changedFields: string[] }) =>
    recordAudit('deal.updated', p.tenantId, 'deal.updated', 'Deal', p.dealId, p.userId, { changedFields: p.changedFields })
  );
  eventBus.on('deal.deleted', (p: { dealId: string; tenantId: string; userId?: string }) =>
    recordAudit('deal.deleted', p.tenantId, 'deal.deleted', 'Deal', p.dealId, p.userId)
  );
  eventBus.on('deal.won', (p: { dealId: string; tenantId: string; userId?: string }) =>
    recordAudit('deal.won', p.tenantId, 'deal.won', 'Deal', p.dealId, p.userId)
  );
  eventBus.on('deal.lost', (p: { dealId: string; tenantId: string; userId?: string }) =>
    recordAudit('deal.lost', p.tenantId, 'deal.lost', 'Deal', p.dealId, p.userId)
  );
  eventBus.on('invoice.created', (p: { invoiceId: string; tenantId: string; dealId?: string; userId?: string }) =>
    recordAudit('invoice.created', p.tenantId, 'invoice.created', 'Invoice', p.invoiceId, p.userId, { dealId: p.dealId })
  );
  eventBus.on('invoice.paid', (p: { invoiceId: string; tenantId: string; dealId?: string; userId?: string }) =>
    recordAudit('invoice.paid', p.tenantId, 'invoice.paid', 'Invoice', p.invoiceId, p.userId, { dealId: p.dealId })
  );
  eventBus.on('invoice.updated', (p: { invoiceId: string; tenantId: string; userId?: string; changedFields: string[] }) =>
    recordAudit('invoice.updated', p.tenantId, 'invoice.updated', 'Invoice', p.invoiceId, p.userId, { changedFields: p.changedFields })
  );
  eventBus.on('invoice.deleted', (p: { invoiceId: string; tenantId: string; userId?: string }) =>
    recordAudit('invoice.deleted', p.tenantId, 'invoice.deleted', 'Invoice', p.invoiceId, p.userId)
  );
  eventBus.on('user.registered', (p: { userId: string; tenantId: string }) =>
    recordAudit('user.registered', p.tenantId, 'user.registered', 'User', p.userId, p.userId)
  );
}
