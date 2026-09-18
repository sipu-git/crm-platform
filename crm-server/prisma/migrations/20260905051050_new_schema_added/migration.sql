-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'CONVERTED';

-- DropIndex
DROP INDEX "Contacts_email_key";

-- DropIndex
DROP INDEX "Contacts_tenant_id_companyId_email_key";

-- DropIndex
DROP INDEX "User_email_key";
