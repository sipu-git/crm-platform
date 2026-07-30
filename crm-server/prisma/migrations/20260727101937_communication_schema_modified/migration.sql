-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'CALL', 'SMS', 'INTERNAL_NOTE');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'FILE', 'NOTE');

-- CreateTable
CREATE TABLE "Communications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "deal_id" TEXT,
    "company_id" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "direction" "CommunicationDirection" NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "media_url" TEXT,
    "media_type" TEXT,
    "file_name" TEXT,
    "provider_message_id" TEXT,
    "status" "CommunicationStatus" NOT NULL,
    "metaData" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Communications_provider_message_id_key" ON "Communications"("provider_message_id");

-- CreateIndex
CREATE INDEX "Communications_tenant_id_contact_id_idx" ON "Communications"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "Communications_provider_message_id_idx" ON "Communications"("provider_message_id");

-- AddForeignKey
ALTER TABLE "Communications" ADD CONSTRAINT "Communications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communications" ADD CONSTRAINT "Communications_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communications" ADD CONSTRAINT "Communications_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communications" ADD CONSTRAINT "Communications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
