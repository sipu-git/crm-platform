/*
  Warnings:

  - You are about to drop the column `project_name` on the `Leads` table. All the data in the column will be lost.
  - You are about to drop the column `project_type` on the `Leads` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `Activities` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Activities" ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "project_id" TEXT;

-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "project_name",
DROP COLUMN "project_type";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_type" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "budget" DECIMAL(65,30),
    "owner_id" TEXT,
    "originating_lead_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_originating_lead_id_key" ON "Project"("originating_lead_id");

-- CreateIndex
CREATE INDEX "Project_tenant_id_idx" ON "Project"("tenant_id");

-- CreateIndex
CREATE INDEX "Project_companyId_idx" ON "Project"("companyId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_originating_lead_id_fkey" FOREIGN KEY ("originating_lead_id") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
