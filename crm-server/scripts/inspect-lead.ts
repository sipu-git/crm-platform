import { prisma } from '../lib/prisma.js';

async function main() {
  const leads = await prisma.leads.findMany({
    where: { company_name: { contains: 'Infosys', mode: 'insensitive' } },
    include: {
      assignee: true,
      company: true,
      contact: true,
    },
  });

  console.log('--- FOUND LEADS ---');
  for (const l of leads) {
    console.log({
      id: l.id,
      tenant_id: l.tenant_id,
      company_name: l.company_name,
      status: l.status,
      assigned_to: l.assigned_to,
      created_At: l.created_At,
      contact: l.contact?.first_name + ' ' + l.contact?.last_name,
    });

    const runs = await prisma.aiAutomationRun.findMany({
      where: { entity_id: l.id },
    });
    console.log('Automation runs for lead:', runs);
  }

  // Also check all sales reps in that tenant
  if (leads.length > 0) {
    const tenantId = leads[0].tenant_id;
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, role: true, full_name: true, assignee: { select: { id: true } } },
    });
    console.log('--- TENANT USERS ---', users);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
