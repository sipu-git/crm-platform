import { eventBus } from '../../shared/event-bus/index.js';
import { runClientConversionWorkflow } from './workflows/client-conversion/workflow.js';
import { runLeadAssignmentWorkflow } from './workflows/lead-assignment/workflow.js';
import { executeAutomationRun } from './services/automation-run.service.js';

export function registerAutomationListeners() {
  eventBus.on('lead.created', (payload: { tenantId: string; leadId: string }) => {
    if (!payload.leadId) {
      console.error('[AI automation] lead.created event is missing leadId.');
      return;
    }
    void executeAutomationRun({
      tenantId: payload.tenantId,
      entityId: payload.leadId,
      workflow: 'LEAD_ASSIGNMENT',
      eventType: 'lead.created',
      run: () => runLeadAssignmentWorkflow({ tenantId: payload.tenantId, leadId: payload.leadId }),
    }).catch((error) => {
      console.error(`[AI automation] Could not start lead assignment for ${payload.leadId}.`, error);
    });
  });

  eventBus.on('deal.won', (payload: { tenantId: string; dealId: string }) => {
    void executeAutomationRun({
      tenantId: payload.tenantId,
      entityId: payload.dealId,
      workflow: 'CLIENT_CONVERSION',
      eventType: 'deal.won',
      run: () => runClientConversionWorkflow({ tenantId: payload.tenantId, dealId: payload.dealId }),
    }).catch((error) => {
      console.error(`[AI automation] Could not start client conversion for deal ${payload.dealId}.`, error);
    });
  });
}
