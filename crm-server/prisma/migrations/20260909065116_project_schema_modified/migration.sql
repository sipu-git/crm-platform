/*
  Warnings:

  - You are about to drop the column `created_by` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_created_by_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "created_by";
