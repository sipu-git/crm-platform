-- CreateEnum
CREATE TYPE "ProjectEnquiryStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "enquiryStatus" "ProjectEnquiryStatus" NOT NULL DEFAULT 'PENDING';
