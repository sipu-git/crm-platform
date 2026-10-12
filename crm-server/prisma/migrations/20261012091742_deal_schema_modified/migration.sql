-- DropIndex
DROP INDEX IF EXISTS "Deal_tenant_id_won_at_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logo_url" TEXT;
