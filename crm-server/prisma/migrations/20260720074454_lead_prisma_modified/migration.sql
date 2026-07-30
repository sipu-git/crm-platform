/*
  Warnings:

  - Added the required column `designation` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leads" ADD COLUMN     "designation" TEXT NOT NULL;
