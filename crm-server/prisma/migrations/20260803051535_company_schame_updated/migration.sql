/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_owner_id_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "owner_id",
ADD COLUMN     "owner_name" TEXT;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_owner_name_fkey" FOREIGN KEY ("owner_name") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
