-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SELF_EMPLOYED', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address_line1" TEXT,
ADD COLUMN     "address_line2" TEXT,
ADD COLUMN     "annual_revenue" DECIMAL(15,2),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "company_status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "custom_fields" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "legal_name" TEXT,
ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "size" "CompanySize",
ADD COLUMN     "source" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "website" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
