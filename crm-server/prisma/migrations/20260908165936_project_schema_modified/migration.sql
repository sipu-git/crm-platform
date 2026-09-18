/*
  Warnings:

  - Added the required column `project_type` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('Web_Application', 'Mobile_Application', 'Desktop_Application', 'SaaS_Platform', 'AI_ML_Application', 'Automation_System', 'IoT_Application');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "project_type",
ADD COLUMN     "project_type" "ProjectType" NOT NULL;
