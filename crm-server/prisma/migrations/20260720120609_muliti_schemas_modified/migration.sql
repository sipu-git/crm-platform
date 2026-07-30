/*
  Warnings:

  - You are about to drop the column `company_id` on the `Contacts` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `is_own` on the `Pipeline` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,companyId,email]` on the table `Contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,name]` on the table `Pipeline` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Pipeline` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_REVIEW', 'WON', 'LOST');

-- DropForeignKey
ALTER TABLE "Contacts" DROP CONSTRAINT "Contacts_company_id_fkey";

-- DropIndex
DROP INDEX "Contacts_email_key";

-- DropIndex
DROP INDEX "Contacts_tenant_id_company_id_email_idx";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "industry" DROP NOT NULL,
ALTER COLUMN "website" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Contacts" DROP COLUMN "company_id",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "value",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Leads" ALTER COLUMN "designation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Pipeline" DROP COLUMN "is_own",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_won" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "probability" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Contacts_tenant_id_idx" ON "Contacts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_tenant_id_companyId_email_key" ON "Contacts"("tenant_id", "companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_tenant_id_name_key" ON "Pipeline"("tenant_id", "name");

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
