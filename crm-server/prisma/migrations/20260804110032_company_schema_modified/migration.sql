-- DropIndex
DROP INDEX "Company_tenant_id_idx";

-- CreateIndex
CREATE INDEX "Company_tenant_id_legal_name_idx" ON "Company"("tenant_id", "legal_name");
