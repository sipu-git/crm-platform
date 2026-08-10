-- AlterTable
ALTER TABLE "Activities" ALTER COLUMN "assigned_to" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
