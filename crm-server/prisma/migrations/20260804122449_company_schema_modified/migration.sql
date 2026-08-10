/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Leads` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `Leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_name` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Leads" DROP CONSTRAINT "Leads_owner_id_fkey";

-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "owner_id",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "owner_name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
