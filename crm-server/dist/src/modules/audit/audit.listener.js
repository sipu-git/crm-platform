import { eventBus } from '../../shared/event-bus.js';
import { auditService } from './audit.service.js';
export function registerAuditListeners() {
    eventBus.on('lead.created', (p) => auditService.record(p.tenantId, 'lead.created', 'Lead', p.leadId));
    eventBus.on('lead.qualified', (p) => auditService.record(p.tenantId, 'lead.qualified', 'Lead', p.leadId));
    eventBus.on('lead.converted', (p) => auditService.record(p.tenantId, 'lead.converted', 'Lead', p.leadId, undefined, { contactId: p.contactId }));
    eventBus.on('deal.stage_changed', (p) => auditService.record(p.tenantId, 'deal.stage_changed', 'Deal', p.dealId, undefined, { stage: p.stage }));
    eventBus.on('deal.won', (p) => auditService.record(p.tenantId, 'deal.won', 'Deal', p.dealId));
    eventBus.on('invoice.created', (p) => auditService.record(p.tenantId, 'invoice.created', 'Invoice', p.invoiceId, undefined, { dealId: p.dealId }));
    eventBus.on('invoice.paid', (p) => auditService.record(p.tenantId, 'invoice.paid', 'Invoice', p.invoiceId));
    eventBus.on('user.registered', (p) => auditService.record(p.tenantId, 'user.registered', 'User', p.userId));
}
