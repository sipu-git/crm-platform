/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,invoice_number]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyer_name` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_type` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_name` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('B2B', 'B2C');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_deal_id_fkey";

-- DropIndex
DROP INDEX "Invoice_invoice_number_key";

-- DropIndex
DROP INDEX "Invoice_tenant_id_invoice_number_idx";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "amount_due" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "amount_paid" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "buyer_address" TEXT,
ADD COLUMN     "buyer_gstin" TEXT,
ADD COLUMN     "buyer_name" TEXT NOT NULL,
ADD COLUMN     "buyer_state" TEXT,
ADD COLUMN     "cgst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "igst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "invoice_type" "InvoiceType" NOT NULL,
ADD COLUMN     "seller_address" TEXT,
ADD COLUMN     "seller_gstin" TEXT,
ADD COLUMN     "seller_name" TEXT NOT NULL,
ADD COLUMN     "seller_state" TEXT,
ADD COLUMN     "sgst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxable_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "terms" TEXT,
ALTER COLUMN "deal_id" DROP NOT NULL,
ALTER COLUMN "contact_id" DROP NOT NULL,
ALTER COLUMN "company_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) DEFAULT 1,
    "unit_price" DECIMAL(65,30),
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(65,30) NOT NULL,
    "tax_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cgst_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sgst_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igst_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "hsn_code" TEXT,
    "sac_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceItem_invoice_id_idx" ON "InvoiceItem"("invoice_id");

-- CreateIndex
CREATE INDEX "Invoice_tenant_id_status_idx" ON "Invoice"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenant_id_deal_id_idx" ON "Invoice"("tenant_id", "deal_id");

-- CreateIndex
CREATE INDEX "Invoice_tenant_id_contact_id_idx" ON "Invoice"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "Invoice_tenant_id_company_id_idx" ON "Invoice"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenant_id_invoice_number_key" ON "Invoice"("tenant_id", "invoice_number");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
