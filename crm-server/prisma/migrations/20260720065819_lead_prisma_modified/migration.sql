/*
  Warnings:

  - Added the required column `company_name` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Leads" DROP CONSTRAINT "Leads_companyId_fkey";

-- AlterTable
ALTER TABLE "Leads" ADD COLUMN     "company_name" TEXT NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
