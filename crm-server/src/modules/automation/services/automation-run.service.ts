import type { Prisma } from '../../../../generated/prisma/client.js';
import { prisma } from '../../../../lib/prisma.js';

export type AutomationWorkflowName = 'LEAD_ASSIGNMENT' | 'CLIENT_CONVERSION';

type AutomationRunInput = {
  tenantId: string;
  entityId: string;
  workflow: AutomationWorkflowName;
  eventType: 'lead.created' | 'deal.won';
  run: () => Promise<unknown>;
};

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/** Records, claims, and executes an automation once per tenant, workflow, and CRM entity. */
export async function executeAutomationRun({ tenantId, entityId, workflow, eventType, run }: AutomationRunInput): Promise<void> {
  const runKey = `${tenantId}:${workflow}:${entityId}`;
  const existing = await prisma.aiAutomationRun.upsert({
    where: { run_key: runKey },
    create: {
      tenant_id: tenantId,
      run_key: runKey,
      workflow,
      event_type: eventType,
      entity_id: entityId,
    },
    update: {},
    select: { status: true },
  });

  if (existing.status === 'SUCCEEDED' || existing.status === 'SKIPPED') return;

  const claimed = await prisma.aiAutomationRun.updateMany({
    where: { run_key: runKey, status: { in: ['PENDING', 'FAILED'] } },
    data: {
      status: 'RUNNING',
      started_at: new Date(),
      finished_at: null,
      error_message: null,
    },
  });
  if (claimed.count === 0) return;

  try {
    const outcome = await run();
    const outcomeStatus = typeof outcome === 'object' && outcome !== null
      ? ('status' in outcome ? outcome.status : 'outcome' in outcome ? outcome.outcome : undefined)
      : undefined;
    const succeeded = outcomeStatus !== 'skipped';
    await prisma.aiAutomationRun.update({
      where: { run_key: runKey },
      data: {
        status: succeeded ? 'SUCCEEDED' : 'SKIPPED',
        result: toJson(outcome),
        finished_at: new Date(),
      },
    });
  } catch (error) {
    await prisma.aiAutomationRun.update({
      where: { run_key: runKey },
      data: {
        status: 'FAILED',
        error_message: 'Automation failed. See server logs for details.',
        finished_at: new Date(),
      },
    });
    console.error(`[AI automation] ${workflow} failed for ${entityId} in tenant ${tenantId}`, error);
  }
}

export async function listAutomationRuns(tenantId: string, limit: number) {
  return prisma.aiAutomationRun.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      workflow: true,
      event_type: true,
      entity_id: true,
      status: true,
      result: true,
      error_message: true,
      started_at: true,
      finished_at: true,
      created_at: true,
    },
  });
}
