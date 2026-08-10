/*
  Warnings:

  - You are about to drop the column `converted_contact_id` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Leads` table. All the data in the column will be lost.
  - Added the required column `contactId` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Leads" DROP CONSTRAINT "Leads_converted_contact_id_fkey";

-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "converted_contact_id",
DROP COLUMN "designation",
DROP COLUMN "email",
DROP COLUMN "full_name",
DROP COLUMN "phone",
ADD COLUMN     "contactId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
