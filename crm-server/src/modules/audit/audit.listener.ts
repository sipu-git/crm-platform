import { eventBus } from '../../shared/event-bus';
import { auditService } from './audit.service';

export function registerAuditListeners() {
  eventBus.on('lead.created', (p: { leadId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'lead.created', 'Lead', p.leadId)
  );

  eventBus.on('lead.qualified', (p: { leadId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'lead.qualified', 'Lead', p.leadId)
  );

  eventBus.on('lead.converted', (p: { leadId: string; tenantId: string; contactId: string }) =>
    auditService.record(p.tenantId, 'lead.converted', 'Lead', p.leadId, undefined, { contactId: p.contactId })
  );

  eventBus.on('deal.stage_changed', (p: { dealId: string; tenantId: string; stage: string }) =>
    auditService.record(p.tenantId, 'deal.stage_changed', 'Deal', p.dealId, undefined, { stage: p.stage })
  );

  eventBus.on('deal.won', (p: { dealId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'deal.won', 'Deal', p.dealId)
  );

  eventBus.on('invoice.created', (p: { invoiceId: string; tenantId: string; dealId: string }) =>
    auditService.record(p.tenantId, 'invoice.created', 'Invoice', p.invoiceId, undefined, { dealId: p.dealId })
  );

  eventBus.on('invoice.paid', (p: { invoiceId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'invoice.paid', 'Invoice', p.invoiceId)
  );

  eventBus.on('user.registered', (p: { userId: string; tenantId: string }) =>
    auditService.record(p.tenantId, 'user.registered', 'User', p.userId)
  );
}
