/*
  Warnings:

  - Made the column `owner_name` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_owner_name_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "owner_name" SET NOT NULL;
