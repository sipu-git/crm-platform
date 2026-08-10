-- DropForeignKey
ALTER TABLE "Assignee" DROP CONSTRAINT "Assignee_userId_fkey";

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
