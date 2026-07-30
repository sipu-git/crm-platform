/*
  Warnings:

  - Added the required column `lead_id` to the `Communications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Communications" ADD COLUMN     "lead_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Communications" ADD CONSTRAINT "Communications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
