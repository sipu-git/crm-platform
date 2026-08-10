-- AlterTable
ALTER TABLE "Leads" ALTER COLUMN "assigned_to" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Leads_assigned_to_idx" ON "Leads"("assigned_to");
