/*
  Warnings:

  - You are about to drop the column `due_date` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "due_date",
DROP COLUMN "start_date",
ADD COLUMN     "timeline" TEXT;
