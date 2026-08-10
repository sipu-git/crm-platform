/*
  Warnings:

  - Changed the type of `entityType` on the `Activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityTypes" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE');

-- AlterTable
ALTER TABLE "Activities" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "ActivityTypes" NOT NULL;
