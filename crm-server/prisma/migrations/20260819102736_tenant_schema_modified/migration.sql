/*
  Warnings:

  - Added the required column `updated_at` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "company_size" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gst_number" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "pan_number" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT;
