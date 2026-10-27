import { prisma } from '../lib/prisma.js';
import { runLeadAssignmentWorkflow } from '../src/modules/automation/workflows/lead-assignment/workflow.js';

async function main() {
  const leadId = 'cmvqca3gu0002qwcppsclzbvs';
  const tenantId = '46082195-c92f-43ac-975c-c01626fae8f0';

  console.log('Running Lead Assignment for Infosys lead...');
  const outcome = await runLeadAssignmentWorkflow({ tenantId, leadId });
  console.log('OUTCOME:', JSON.stringify(outcome, null, 2));

  // Check lead after assignment
  const updatedLead = await prisma.leads.findUnique({
    where: { id: leadId },
    include: { assignee: { include: { user: true } } },
  });
  console.log('UPDATED LEAD ASSIGNEE:', updatedLead?.assignee);
}

main().catch(console.error).finally(() => prisma.$disconnect());

