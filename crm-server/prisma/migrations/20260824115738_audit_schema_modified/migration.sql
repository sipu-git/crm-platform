-- DropForeignKey
ALTER TABLE "audits" DROP CONSTRAINT "audits_userId_fkey";

-- DropIndex
DROP INDEX "audits_tenant_id_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "billing_address" TEXT,
ADD COLUMN     "billing_email" TEXT,
ADD COLUMN     "billing_phone" TEXT,
ADD COLUMN     "gst_number" TEXT,
ADD COLUMN     "pan_number" TEXT,
ADD COLUMN     "place_of_supply" TEXT;

-- AlterTable
ALTER TABLE "audits" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "audits_tenant_id_entityType_entityId_idx" ON "audits"("tenant_id", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
