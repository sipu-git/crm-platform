/*
  Warnings:

  - Added the required column `companyId` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leads" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
