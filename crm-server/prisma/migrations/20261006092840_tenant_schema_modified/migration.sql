/*
  Warnings:

  - A unique constraint covering the columns `[tenant_key]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_key` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "tenant_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_tenant_key_key" ON "Tenant"("tenant_key");
