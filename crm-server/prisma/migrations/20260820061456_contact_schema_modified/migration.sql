/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Contacts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Contacts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contacts" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_email_key" ON "Contacts"("email");
