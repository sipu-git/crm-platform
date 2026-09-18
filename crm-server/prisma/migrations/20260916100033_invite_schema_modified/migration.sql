/*
  Warnings:

  - You are about to drop the column `contact` on the `Invite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "contact",
ADD COLUMN     "mobile" TEXT;
