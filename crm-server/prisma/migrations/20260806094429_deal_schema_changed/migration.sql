/*
  Warnings:

  - Made the column `lead_id` on table `Deal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "lead_id" SET NOT NULL;
