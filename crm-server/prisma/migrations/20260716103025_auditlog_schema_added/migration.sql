-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('Lead', 'Deal', 'Invoice', 'User', 'Notification', 'Tenant');

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metaData" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audits_tenant_id_idx" ON "audits"("tenant_id");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
