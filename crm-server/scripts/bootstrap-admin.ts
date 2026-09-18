import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { pipelineRepository } from '../src/modules/deal/repositories/pipeline.repository.js';

async function main() {
  const tenantName = process.env.BOOTSTRAP_TENANT_NAME?.trim();
  const fullName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const mobile = process.env.BOOTSTRAP_ADMIN_MOBILE?.trim() || 'not-provided';
  if (!tenantName || !fullName || !email || !password) {
    throw new Error('Set BOOTSTRAP_TENANT_NAME, BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD');
  }

  const result = await prisma.$transaction(async (tx) => {
    let tenant = await tx.tenant.findFirst({ where: { name: tenantName } });
    if (!tenant) {
      tenant = await tx.tenant.create({ data: { name: tenantName } });
      await pipelineRepository.seedDefaultStages(tx, tenant.id);
    }
    let user = await tx.user.findFirst({ where: { tenantId: tenant.id, email } });
    if (!user) {
      user = await tx.user.create({
        data: { tenantId: tenant.id, full_name: fullName, company_name: tenant.name, email, password: await bcrypt.hash(password, 12), mobile, role: 'ADMIN' },
      });
    }
    return { tenantId: tenant.id, userId: user.id, created: Boolean(user) };
  });
  // Deliberately do not print credentials or tokens.
  console.log(`Bootstrap complete for tenant ${result.tenantId}, admin ${result.userId}.`);
}

main().finally(() => prisma.$disconnect());
