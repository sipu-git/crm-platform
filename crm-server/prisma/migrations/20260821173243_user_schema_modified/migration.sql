-- AlterTable
ALTER TABLE "User" ADD COLUMN     "company_id" TEXT;

-- CreateIndex
CREATE INDEX "User_company_id_idx" ON "User"("company_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
