/*
  Warnings:

  - You are about to drop the column `companyId` on the `Leads` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Leads" DROP CONSTRAINT "Leads_companyId_fkey";

-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "companyId";

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_company_name_fkey" FOREIGN KEY ("company_name") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
