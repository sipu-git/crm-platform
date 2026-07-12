import { eventBus } from '../../core/event-bus';
import { auditService } from './audit.service';

/**
 * Listens to every significant domain event tenant-wide and writes an
 * immutable audit trail entry. This module is intentionally broad —
 * that's its entire purpose — but it never mutates state, only records it.
 */
export function registerAuditListeners() {
  eventBus.on('lead.created', (p: { leadId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'lead.created', 'lead', p.leadId)
  );

  eventBus.on('lead.qualified', (p: { leadId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'lead.qualified', 'lead', p.leadId)
  );

  eventBus.on('lead.converted', (p: { leadId: string; tenantId: string; contactId: string }) =>
    auditService.record(p.tenantId, 'lead.converted', 'lead', p.leadId, undefined, { contactId: p.contactId })
  );

  eventBus.on('deal.stage_changed', (p: { dealId: string; tenantId: string; stage: string }) =>
    auditService.record(p.tenantId, 'deal.stage_changed', 'deal', p.dealId, undefined, { stage: p.stage })
  );

  eventBus.on('deal.won', (p: { dealId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'deal.won', 'deal', p.dealId)
  );

  eventBus.on('invoice.created', (p: { invoiceId: string; tenantId: string; dealId: string }) =>
    auditService.record(p.tenantId, 'invoice.created', 'invoice', p.invoiceId, undefined, { dealId: p.dealId })
  );

  eventBus.on('invoice.paid', (p: { invoiceId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'invoice.paid', 'invoice', p.invoiceId)
  );

  eventBus.on('user.registered', (p: { userId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'user.registered', 'user', p.userId)
  );
}
