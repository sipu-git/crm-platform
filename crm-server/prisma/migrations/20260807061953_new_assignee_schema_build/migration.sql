/*
  Warnings:

  - Added the required column `assigned_to` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leads" ADD COLUMN     "assigned_to" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Assignee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "userId" TEXT,

    CONSTRAINT "Assignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_userId_key" ON "Assignee"("userId");

-- CreateIndex
CREATE INDEX "Assignee_tenant_id_idx" ON "Assignee"("tenant_id");

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Assignee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
