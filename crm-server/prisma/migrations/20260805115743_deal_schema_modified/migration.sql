/*
  Warnings:

  - Added the required column `project_name` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "lead_id" TEXT;

-- AlterTable
ALTER TABLE "Leads" ADD COLUMN     "project_name" TEXT NOT NULL,
ADD COLUMN     "project_type" TEXT;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
