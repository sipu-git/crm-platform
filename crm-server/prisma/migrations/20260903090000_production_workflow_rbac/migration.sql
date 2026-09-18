-- Production workflow: invitations, client/project membership and idempotent
-- deal-to-project conversion.  This migration is additive; existing records are retained.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";
ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_email_key";
ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_tenant_id_companyId_email_key";

CREATE UNIQUE INDEX IF NOT EXISTS "User_tenantId_email_key" ON "User"("tenantId", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "Contacts_tenant_id_email_key" ON "Contacts"("tenant_id", "email");

CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

CREATE TABLE "Invite" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "token_hash" TEXT NOT NULL,
  "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "invited_by_id" TEXT NOT NULL,
  "accepted_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invite_token_hash_key" ON "Invite"("token_hash");
CREATE INDEX "Invite_tenant_id_email_idx" ON "Invite"("tenant_id", "email");
CREATE INDEX "Invite_tenant_id_status_idx" ON "Invite"("tenant_id", "status");
-- PostgreSQL partial index prevents duplicate live invitations without blocking history.
CREATE UNIQUE INDEX "Invite_one_active_per_role" ON "Invite"("tenant_id", "email", "role") WHERE "status" = 'PENDING';

ALTER TABLE "Invite" ADD CONSTRAINT "Invite_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_accepted_user_id_fkey" FOREIGN KEY ("accepted_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "originating_deal_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Project_originating_deal_id_key" ON "Project"("originating_deal_id");
ALTER TABLE "Project" ADD CONSTRAINT "Project_originating_deal_id_fkey" FOREIGN KEY ("originating_deal_id") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ProjectMember" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProjectMember_project_id_user_id_key" ON "ProjectMember"("project_id", "user_id");
CREATE INDEX "ProjectMember_tenant_id_user_id_idx" ON "ProjectMember"("tenant_id", "user_id");
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
