/*
  Warnings:

  - You are about to drop the column `email` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Leads` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Leads_email_key";

-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "email",
DROP COLUMN "phone";
