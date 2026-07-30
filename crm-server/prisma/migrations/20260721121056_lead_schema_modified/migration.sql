/*
  Warnings:

  - Made the column `companyId` on table `Leads` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Leads" DROP CONSTRAINT "Leads_company_name_fkey";

-- AlterTable
ALTER TABLE "Leads" ALTER COLUMN "companyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
