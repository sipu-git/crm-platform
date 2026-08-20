-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "contact_id" TEXT,
ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
