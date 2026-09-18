-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "enquiry_id" TEXT;

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "project_name" TEXT,
    "project_type" "ProjectType",
    "source" "Source" NOT NULL DEFAULT 'WEBSITE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
