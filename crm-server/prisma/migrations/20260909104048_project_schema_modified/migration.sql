/*
  Warnings:

  - You are about to drop the column `budget` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `project_name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `project_type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "budget",
DROP COLUMN "description",
DROP COLUMN "project_name",
DROP COLUMN "project_type",
DROP COLUMN "timeline";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
