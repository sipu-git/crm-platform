/*
  Warnings:

  - Added the required column `entityType` to the `Activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activities" ADD COLUMN     "entityType" "AuditEntityType" NOT NULL;
