/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,legal_name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_tenant_id_legal_name_key" ON "Company"("tenant_id", "legal_name");
